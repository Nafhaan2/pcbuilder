// src/utils/sanitize.js
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Basic sanitization - in production, use DOMPurify
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script tags and event handlers
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  const elements = doc.querySelectorAll('*');
  elements.forEach(el => {
    // Remove event handlers
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return doc.body.innerHTML;
};