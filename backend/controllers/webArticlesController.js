import axios from 'axios';
import Article from '../models/Article.js';
export const getwebArticles = async (req, res) => {
    try {
        const webArticles = await axios.get('https://api.example.com/web-articles');
        res.status(200).json(webArticles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const webArticleREGEXsearch = async (req, res) => {
    const { regex } = req.params;
    try {
        const webArticles = await axios.get(`https://api.example.com/web-articles/${regex}`);
        res.status(200).json(webArticles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const savewebArticle = async (req, res) => {
    const { title, content } = req.body;
    try {
        const webArticle = await Article.save({ title, content });
        res.status(201).json(webArticle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}