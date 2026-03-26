/**
 * Extracts a specific metadata value by its label from a parsed Notion item.
 * 
 * @param {Object} item - The Notion item containing a metadata array.
 * @param {string} label - The exact label to search for (case-insensitive).
 * @returns {any} - The value of the matched metadata, or undefined.
 */
export const getMetaValue = (item, label) => {
  const meta = item?.metadata?.find(
    (m) => m.label && m.label.toLowerCase() === label.toLowerCase()
  );
  return meta?.value;
};

/**
 * Resolves the display names for a list of related Notion item IDs.
 * 
 * @param {Array<string>} ids - Array of related item IDs.
 * @param {string} type - 'project' or 'offer' to determine which source to query.
 * @param {Array<Object>} projects - The projects list.
 * @param {Array<Object>} offers - The offers list.
 * @returns {string} - Comma-separated list of relation names, or '-'.
 */
export const resolveRelationNames = (ids, type, projects = [], offers = []) => {
  if (!ids || ids.length === 0) return '-';
  const source = type === 'project' ? projects : offers;
  
  return ids
    .map((id) => {
      const found = source.find((item) => item.id === id);
      return found?.identification?.name || '...';
    })
    .join(', ');
};
/**
 * Resolves the project name associated with a list of offer IDs.
 * Used for Invoices where the link to the project is indirect (via Offer).
 * 
 * @param {Array<string>} offerIds - Array of related offer IDs.
 * @param {Array<Object>} projects - The projects list.
 * @param {Array<Object>} offers - The offers list.
 * @returns {string} - Combined project names or '-'.
 */
export const resolveProjectFromOffer = (offerIds, projects = [], offers = []) => {
  if (!offerIds || offerIds.length === 0) return '-';
  
  const projectNames = offerIds
    .map((offerId) => {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) return null;
      
      // 1. Direct project name if resolved by backend
      if (offer.identification?.project_name) return offer.identification.project_name;
      
      // 2. Resolve via project_relation IDs
      const projectIds = offer.identification?.project_relation || [];
      if (projectIds.length === 0) return null;
      
      return resolveRelationNames(projectIds, 'project', projects, offers);
    })
    .filter(Boolean);

  return projectNames.length > 0 ? [...new Set(projectNames)].join(', ') : '-';
};

/**
 * Groups invoices by their related offer ID to allow reverse lookups.
 * 
 * @param {Array<Object>} invoices - The invoices list.
 * @param {Array<Object>} offers - The offers list.
 * @returns {Object} - A map where keys are offer IDs and values are arrays of invoice names.
 */
export const resolveInvoiceMap = (invoices = [], offers = []) => {
  const map = {};
  if (!invoices || !offers) return map;

  invoices.forEach((inv) => {
    const relatedOfferIds =
      inv.metadata
        ?.filter((m) => m.type === 'relation')
        ?.flatMap((m) => (Array.isArray(m.value) ? m.value : [m.value]))
        ?.filter((id) => offers.some((o) => o.id === id)) || [];

    relatedOfferIds.forEach((id) => {
      if (!map[id]) map[id] = [];
      if (inv.identification?.name) {
        map[id].push(inv.identification.name);
      }
    });
  });
  return map;
};

/**
 * Combines direct and reverse invoice relations for a given item (Project/Offer).
 * 
 * @param {Object} p - The item to resolve invoices for.
 * @param {Array<Object>} invoices - The invoices list.
 * @param {Object} reverseInvoiceMap - The pre-calculated reverse invoice map.
 * @returns {string} - Comma-separated list of invoice names, or '-'.
 */
export const resolveAllLinkedInvoices = (p, invoices = [], reverseInvoiceMap = {}) => {
  // 1. Direct relations (from Offer/Project to Invoice)
  const directIds =
    p.metadata
      ?.filter((m) => m.type === 'relation')
      ?.flatMap((m) => (Array.isArray(m.value) ? m.value : [m.value]))
      ?.filter((id) => invoices.some((i) => i.id === id)) || [];

  const directNames = directIds
    .map((id) => {
      return invoices.find((i) => i.id === id)?.identification?.name;
    })
    .filter(Boolean);

  // 2. Reverse relations (from Invoices pointing to this Offer)
  const reverseNames = reverseInvoiceMap[p.id] || [];

  // Combine and unique
  const all = [...new Set([...directNames, ...reverseNames])];
  return all.length > 0 ? all.join(', ') : '-';
};
