
export function transformArticlePayload(values) {
  const payload = { ...values };

  if (typeof payload.keywords === 'string') {
    payload.keywords = payload.keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
  }

  // authors: array de objetos { name }
  if (typeof payload.authors === 'string') {
    payload.authors = payload.authors
      .split(',')
      .map(a => ({ name: a.trim() }))
      .filter(a => a.name);
  }

  // referenceCount y citationCount: number
  if (payload.referenceCount !== undefined && payload.referenceCount !== '') {
    payload.referenceCount = Number(payload.referenceCount);
  }
  if (payload.citationCount !== undefined && payload.citationCount !== '') {
    payload.citationCount = Number(payload.citationCount);
  }

  // is_oa: boolean
  if (typeof payload.is_oa === 'string') {
    payload.is_oa = payload.is_oa === 'true' || payload.is_oa === 'on' || payload.is_oa === true;
  }

  return payload;
}