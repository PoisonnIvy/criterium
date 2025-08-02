/* eslint-disable no-unused-vars */


export function toCapitalize(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function normalizeLanguage(lang) {
  if(!lang || lang === 'No definido' || lang === null || lang === undefined) return 'No definido'
  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'language' });
    if (Array.isArray(lang)) {
      return lang
        .filter(l => l && typeof l === 'string' && l.trim() !== '')
        .map(l => displayNames.of(l.toLowerCase()) || l)
        .join(', ');
    }
      return displayNames.of(lang.toLowerCase()) || lang;
  } catch (e) {
    return "No definido";
  }
};

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '');
};