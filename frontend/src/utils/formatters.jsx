/**
 * Renders text containing URLs into click-able React elements.
 * 
 * @param {string} text - The raw text that might contain URLs.
 * @returns {Array|string|null} - Array of React nodes (text and links) or null if input is falsy.
 */
export const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline break-all transition-colors"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};
