import Article from '../models/article.js';

export const addArticle = async (req, res) => {
    const projectId = req.project._id;
    const userId = req.session.userId;
    const { title, tags, abstract, 
            source, pdfPath, OA_URl,
            doi, doiUrl, otherIdentifiers,
            publicationType, metadata} = req.body;


    try {
        const newArticle = new Article({
            title,tags,abstract,
            source, pdfPath, OA_URl,
            doi, doiUrl, otherIdentifiers,
            publicationType, metadata,
            projectId, addedBy: userId, 
        });
        await newArticle.save();
        res.status(201).json({ message: 'Artículo añadido exitosamente', project: newArticle });
    } catch (error) {
        res.status(500).json({ message: 'Error al añadir el artículo', error });
    }
}


export const removeArticle = async (req, res) => {

    try {
        await Article.findByIdAndDelete(req.article._id);
        res.status(204).json({message:'Articulo eliminado exitosamente'});
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el artículo', error });
    }
}

export const updateArticle = async (req, res) => {
    const article = req.article;
    const modifiedBy = req.session.userId;
    const fields = ['title', 'tags', 'abstract',
        'source', 'pdfPath', 'OA_URl',
        'doi', 'doiUrl', 'otherIdentifiers',
        'publicationType', 'metadata'];
    const updatedFields={};
    
    try {
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                article[field] = req.body[field];
                updatedFields[field]= req.body[field];
            }
        });

        article.modifiedBy=modifiedBy;

        await article.save();
        res.status(200).json({message:'Cambios guardados exitosamente', changed:updatedFields})
    } catch (error) {
        res.status(500).json({message:'Ha ocurrido un error al actualizar el artículo', error})
    }
       

}
    

export const markArticle = async (req, res) => {
    const article = req.article;
    const userId = req.session.userId;
    const {status} = req.body

    try {
        if (!['pendiente', 'aceptado', 'descartado'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }
        article.status = status;
        article.modifiedBy = userId;
        const updatedArticle = await article.save();
        res.status(200).json({message:'Estado actualizado', new_value:`${updatedArticle.status}` });
    } catch (error) {
        res.status(500).json({ message: 'Erroral marcar el artículo', error });
    }
}


export const getArticles = async (req, res) => {
    
    try {
        const articles = await Article.find({projectId: req.project._id});
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los artículos', error });
    }
}
export const getArticleById = async (req, res) => {
    const article= req.article;

    try {
        if (!article) {
            return res.status(404).json({ message: 'Articulo no encontrado' });
        }   
        res.status(200).json(article);
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el artículo', error });
    }
}


