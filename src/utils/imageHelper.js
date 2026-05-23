// Local image preview resolver helper to allow previewing uploaded files locally

if (!window.localImagePreviews) {
  window.localImagePreviews = {};
}

/**
 * Cache an image's base64 representation locally.
 * @param {string} relativeUrl - The url of the image (e.g. 'uploads/filename.jpg')
 * @param {string} base64DataUrl - The Base64 Data URL (e.g. 'data:image/jpeg;base64,...')
 */
export const cacheLocalPreview = (relativeUrl, base64DataUrl) => {
  if (!relativeUrl) return;
  
  // Save in memory for fast retrieval
  window.localImagePreviews[relativeUrl] = base64DataUrl;
  
  // Save in localStorage for persistence across reloads
  try {
    localStorage.setItem(`local-img-preview-${relativeUrl}`, base64DataUrl);
  } catch (e) {
    console.warn("Failed to save preview in localStorage (quota exceeded?):", e);
  }
};

/**
 * Resolve an image URL. If it's a local uploaded file and has a cached preview,
 * returns the cached Base64 Data URL; otherwise returns the original URL.
 * @param {string} url - The image URL
 * @returns {string} - Resolved image URL
 */
export const resolveImageUrl = (url) => {
  if (!url) return url;
  
  // If it's a relative upload path
  if (url.startsWith("uploads/")) {
    // Check in-memory cache first
    if (window.localImagePreviews[url]) {
      return window.localImagePreviews[url];
    }
    // Check localStorage
    try {
      const cached = localStorage.getItem(`local-img-preview-${url}`);
      if (cached) {
        window.localImagePreviews[url] = cached; // cache in memory
        return cached;
      }
    } catch (e) {
      console.warn("Failed to load preview from localStorage:", e);
    }
  }
  return url;
};

/**
 * Resolve all uploaded image references inside an HTML string (compiled Markdown).
 * @param {string} html - The HTML string containing <img src="uploads/..." />
 * @returns {string} - The HTML string with resolved images
 */
export const resolveImagePreviewsInHtml = (html) => {
  if (!html) return html;
  
  // Replace matches of src="uploads/..." or src='uploads/...'
  return html.replace(/src=["']uploads\/([^"']+)["']/g, (match, filename) => {
    const relativeUrl = `uploads/${filename}`;
    const resolved = resolveImageUrl(relativeUrl);
    if (resolved !== relativeUrl) {
      const quoteChar = match.charAt(4); // " or '
      return `src=${quoteChar}${resolved}${quoteChar}`;
    }
    return match;
  });
};
