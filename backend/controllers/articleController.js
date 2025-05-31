import Article from '../models/article.js';


//aun no se como voy a mandejar los articuos, si una coleccion por projecto o todos en una sola coleccion...
// si fuera por projecto basta con el id del articulo, si es una sola coleccion se debe crear un indice por projecto
//cambia la request segun eso, revisar
export const addArticle = async (req, res) => {
    const { projectID } = req.params;
    const { articleId } = req.body;

    try {
        const updatedBaseForm = await baseForm.findByIdAndUpdate(
            id,
            { $addToSet: { articles: articleId } },
            { new: true }
        );
        if (!updatedBaseForm) {
            return res.status(404).json({ message: 'Base form not found' });
        }
        res.status(200).json(updatedBaseForm);
    } catch (error) {
        res.status(500).json({ message: 'Error adding article', error });
    }
}
export const removeArticle = async (req, res) => {
    const { id } = req.params;
    const { articleId } = req.body;

    try {
        const removedArticle = await Article.findByIdAndUpdate(id);
        if (!removedArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json({message:'Article removed'});
    } catch (error) {
        res.status(304).json({ message: 'Error removing article', error });
    }
}

export const markArticle = async (req, res) => {
    const { id } = req.params;
    const { articleId, status } = req.body;

    try {
        const updatedArticle = await Article.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );
        if (!updatedArticle) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Error marking article', error });
    }
}
export const getArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error });
    }
}