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
