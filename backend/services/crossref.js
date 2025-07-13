import axios from 'axios';
import NodeCache from 'node-cache';

const crossref_url = 'https://api.crossref.org';
const mail = process.env.MAILTO;
export const crossrefCache = new NodeCache({ stdTTL: 7 * 24 * 60 * 60, checkperiod: 24*60*60 });

export async function searchWorksService({ title, page = 1, limit = 10, filter = {} }) {
    const { abstract, publicationType, yearFrom, yearTo } = filter || {};
    const cacheKey = `${title.toLowerCase()}_${page}_${limit}`;
    const cached = crossrefCache.get(cacheKey);
    if (cached) {
        return cached;
    }
    try {
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let crossrefFilters = [];
        if (publicationType) crossrefFilters.push(`type:${publicationType}`);
        if (yearFrom) crossrefFilters.push(`from-pub-date:${yearFrom}`);
        if (yearTo) crossrefFilters.push(`until-pub-date:${yearTo}`);
        if (typeof abstract === 'boolean') {
            crossrefFilters.push(`has-abstract:${abstract ? 1 : 0}`);
        }

        const response = await axios.get(`${crossref_url}/works`, {
            params: {
                'query.title': title,
                rows: limit,
                offset: offset,
                mailto: mail,
                filter: crossrefFilters.length ? crossrefFilters.join(',') : undefined
            }
        });

        const works = response.data.message.items.map(work => ({
            title: work.title?.[0] || 'Sin título',
            abstract: work.abstract || 'Abstract no disponible',
            source: work.source || '',
            doi: work.DOI || '',
            doiUrl: work.URL || (work.DOI ? `https://doi.org/${work.DOI}` : 'No existe url asociada'),
            publicationType: work.type || 'No definido',
            year: work.published?.['date-parts'][0][0] || 'sin información',
            volume: work.volume || '',
            issue: work['edition-number'] || 'sin información',
            pages: work.page || '',
            authors: work.author?.map(author => ({
                name: `${author.given || ''} ${author.family || ''}`.trim()
            })) || [],
            journal: work['container-title']?.[0] || '',
            isbn: work.ISBN?.[0] || '',
            publisher: work.publisher || '',
            referenceCount: work['references-count'] || '0',
            citationCount: work['is-referenced-by-count'] || '0',
            language: work?.language || 'No definido'
        }));

        const total = response.data.message['total-results'];
        const result = { status: 'completado', totalResults: total, works: works };
        crossrefCache.set(cacheKey, result);
        return result;
    } catch (error) {
        throw error;
    }
}