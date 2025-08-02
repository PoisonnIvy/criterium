import axios from 'axios';
import NodeCache from 'node-cache';

const unpaywall_url = 'https://api.unpaywall.org/v2';
const mail = process.env.GMAIL;
export const unpaywallCache = new NodeCache({ stdTTL: 3 * 24 * 60 * 60, checkperiod: 24*60*60 });

export async function checkOpenAccessService(dois) {
    const results = [];
    for (const doi of dois) {
        if (unpaywallCache.has(doi)) {
            results.push(unpaywallCache.get(doi));
            continue;
        }
        try {
            const response = await axios.get(`${unpaywall_url}/${doi}?email=${mail}`);
            let oaInfo;
            if (response.data.is_oa === true) {
                oaInfo = {
                    doi: response.data.doi,
                    is_oa: true,
                    oa_url: response.data.best_oa_location?.url_for_pdf || 'Sin link directo al pdf OpenAccess',
                    other_url:response.data.oa_locations.map(oa => ({
                            link: oa.url,
                            pdfLink: oa.url_for_pdf || 'Sin link directo al pdf',
                            version: oa.version || 'Sin información sobre esta version'
                        })) || []
                };
            } else {
                oaInfo = {
                    doi: response.data.doi,
                    is_oa: false,
                    oa_url: 'No hay openAccess para este artículo',
                    other_url: []
                };
            }
            unpaywallCache.set(doi, oaInfo);
            results.push(oaInfo);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            const oaInfo = {
                doi,
                is_oa: false,
                error: error.response?.status === 404 ? 'DOI no encontrado' : 'Error de consulta',
                oa_url: null,
                other_url: []
            };
            unpaywallCache.set(doi, oaInfo);
            results.push(oaInfo);
        }
    }
    return results;
}