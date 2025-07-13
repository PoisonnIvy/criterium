import { checkOpenAccessService } from '../services/unpaywall.js';
import { searchWorksService } from '../services/crossref.js';

export const searchWorks = async (req, res) => {
    const { title, page = 1, limit = 10, filter} = req.query;
    try {
        const result = await searchWorksService({ title, page, limit, filter});
        res.status(200).json(result);
    } catch (error) {
        console.error('Crossref error:', error?.response?.data || error.message || error);
        res.status(500).json({ status: 'error', error: error?.response?.data || error.message || error });
    }
};

export const checkOpenAccess = async (req, res) => {
    const articles = req.body;
    if (!Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ error: 'El body debe ser un array de DOIs' });
    }
    try {
        const results = await checkOpenAccessService(articles);
        res.status(201).json({ results });
    } catch (error) {
        res.status(500).json({ error: 'Error consultando OpenAccess', details: error.message });
    }
};