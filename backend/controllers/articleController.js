import Article from '../models/article.js';
import axios from 'axios';
import { checkOpenAccessService, unpaywallCache } from '../services/unpaywall.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addArticle = async (req, res) => {
    const projectId = req.project._id;
    const userId = req.session.userId;
    const {
        title, tags, abstract, source, pdfPath,
        is_oa, openAccessURL, other_url, doi, doiUrl, otherIdentifiers,
        publicationType, year, volume, issue, pages, keywords, authors,
        journal, publisher, referenceCount, citationCount, language
    } = req.body; 

    if (doi && doi.trim() !== '') {
        const exists = await Article.findOne({ projectId, doi });
        if (exists) {
            return res.status(409).json({ message: 'Ya existe un artículo con ese DOI en el proyecto.' });
        }
    }
    let oaInfo = {};
    if (doi) {
        try {
            const result = await checkOpenAccessService([doi]);
            oaInfo = result[0] || {};
        } catch (error) {
            console.log('Error consultando OpenAccess:', error);
        }
    }

    try {
        const newArticle = new Article({
            title,tags,abstract,
            source, pdfPath, 
            is_oa: oaInfo.is_oa ?? is_oa ?? false,
            openAccessURL: oaInfo.oa_url ?? openAccessURL ?? '',
            other_url: oaInfo.other_url ?? other_url ?? [],
            doi, doiUrl, otherIdentifiers,
            publicationType,year, 
            volume,issue,pages,keywords,authors,
            journal, publisher, referenceCount, citationCount, 
            language, projectId:projectId, addedBy: userId, 
        });
        await newArticle.save();

        if (!newArticle.doi || newArticle.doi.trim() === '') {
            newArticle.doi = newArticle._id.toString();
            await newArticle.save();
        }
        res.status(201).json({ message: 'Artículo añadido exitosamente', project: newArticle });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Ya existe un artículo con ese DOI u otro campo único.' });
        }
        res.status(500).json({ message: 'Error al añadir el artículo', error });
    }
}


export const removeArticle = async (req, res) => {
    const { pdf } = req.query;
    const article = req.article;
    const filePath = article.pdfPath ? path.join(__dirname, '..', article.pdfPath) : null;
    article.modifiedBy = req.session.userId;
    try {
        if (pdf === 'true') {
            if (filePath) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error al eliminar el archivo PDF:', err);
                    }
                });
            }
            article.pdfPath = '';
            await article.save();
            return res.status(200).json({ message: 'Archivo PDF eliminado y referencia quitada.' });
        } else {
            // Eliminar el artículo y el archivo PDF si existe
            if (filePath) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error al eliminar el archivo PDF:', err);
                    }
                });
            }
            await Article.findByIdAndDelete(article._id);
            return res.status(204).json({ message: 'Artículo y archivo PDF eliminados exitosamente.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el artículo o archivo', error });
    }
}

export const updateArticle = async (req, res) => {
    const article = req.article;
    const modifiedBy = req.session.userId;
    const fields = ['title', 'tags', 'abstract',
        'source', 'pdfPath', 'is_oa','openAccessURL','other_url',
        'doi', 'doiUrl', 'otherIdentifiers',
        'publicationType', 'year', 
            'volume',
            'issue',
            'pages',
            'keywords',
            'authors',
            'journal', 
            'publisher', 
            'referenceCount', 
            'citationCount', 
            'language' ];
    
    try {
        fields.forEach(field => {
            if (req.body[field] !== undefined || req.body[field] !== null) {
                article[field] = req.body[field];
            }
        });

        article.modifiedBy=modifiedBy;

        await article.save();
        res.status(200).json({message:'Cambios guardados exitosamente'})
    } catch (error) {
        res.status(500).json({message:'Ha ocurrido un error al actualizar el artículo', error})
    }
       

}
    

export const markArticle = async (req, res) => {
    const article = req.article;
    const userId = req.session.userId;
    const {status, criteriaNotes} = req.body

    try {
        if (!['pendiente', 'aceptado', 'descartado'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }
        article.status = status;
        if (criteriaNotes) article.criteriaNotes = criteriaNotes;
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

async function checkUrlAvailable(url) {
  if (!url) return false;
  try {
    const res = await axios.head(url, { timeout: 5000 });
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

export const getArticleById = async (req, res) => {
    const article= req.article;

    try {
        if (!article) {
            return res.status(404).json({ message: 'Articulo no encontrado' });
        }   

        const sources = [];
    if (article.pdfPath) {
      sources.push({ label: 'PDF local', url: article.pdfPath, type: 'pdf' });
    }
    if (article.openAccessURL!== 'Sin link directo al pdf OpenAccess') {
        sources.push({ label: 'Open Access', url: article.openAccessURL, type: 'pdf' });
    }
    if (Array.isArray(article.other_url)) {
      article.other_url.forEach((src, idx) => {
        if (src.pdfLink) {
          sources.push({ label: src.version || `Fuente ${idx + 1}`, url: src.pdfLink, type: 'pdf' });
        } else if (src.link) {
          sources.push({ label: src.version || `Fuente ${idx + 1}`, url: src.link, type: 'pdf' });
        }
      });
    }
    if (article.doiUrl) {
      sources.push({ label: 'DOI', url: article.doiUrl, type: 'pdf' });
    }
    sources.push({ label: 'Resumen (abstract)', url: null, type: 'abstract', abstract: article.abstract });


    const checkedSources = await Promise.all(
      sources.map(async src => {
        if (src.type === 'pdf' && src.url) {
          const ok = await checkUrlAvailable(src.url);
          return { ...src, ok };
        }
        if (src.type === 'abstract') return { ...src, ok: true };
        return { ...src, ok: false };
      })
    );

        res.status(200).json({ ...article.toObject(), sources: checkedSources });
     }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el artículo', error });
    }
}

export const addArticlesBulk = async (req, res) => {
    const projectId = req.project._id;
    const userId = req.session.userId;
    const { articles } = req.body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ 
            message: 'Se requiere un array de artículos válido' 
        });
    }
    const dois = articles.map(a => a.doi);
    const doisNoCache = dois.filter(doi => !unpaywallCache.has(doi));

    try {  

        let oaResults = [];
        if (doisNoCache.length > 0) {
            oaResults = await checkOpenAccessService(doisNoCache);
            oaResults.forEach(oa => unpaywallCache.set(oa.doi, oa));
        }

        const existingDois = await Article.find({ projectId, doi: { $in: dois } }).distinct('doi');
        let articlesToInsert = articles.filter(a => a.doi && !existingDois.includes(a.doi));
        

         articlesToInsert = articles.map(article => {
            const oaInfo = unpaywallCache.get(article.doi) || {};

            return{
                title: article.title,
                abstract: article.abstract,
                source: article.source || '',
                is_oa: oaInfo.is_oa || false,
                openAccessURL: oaInfo.oa_url || '',
                other_url: oaInfo.other_url || [],
                doi: article.doi && article.doi.trim() !== '' ? article.doi : undefined,
                doiUrl: article.doiUrl,
                publicationType: article.publicationType || 'journal-article',
                year: article.year,
                volume: article.volume || '',
                issue: article.issue,
                pages: article.pages || '',
                authors: article.authors || [],
                journal: article.journal || '',
                publisher: article.publisher,
                referenceCount: article.referenceCount,
                citationCount: article.citationCount,
                language: article.language || 'No definido',
                projectId: projectId,
                addedBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        const result = await Article.insertMany(articlesToInsert, {
            ordered: false,
            rawResult: true
        });

        const insertedArticles = await Article.insertMany(articlesToInsert, { ordered: false });
        for (const art of insertedArticles) {
            if (!art.doi || art.doi.trim() === '') {
                art.doi = art._id.toString();
                await art.save();
            }
        }

        res.status(201).json({ 
            message: `${result.insertedCount} artículos añadidos exitosamente`,
            insertedCount: result.insertedCount,
            totalAttempted: articles.length,
            insertedIds: result.insertedIds
        });

    } catch (error) {
        if (error.code === 11000) {
            const insertedCount = error.result?.insertedCount || 0;
            const duplicateCount = articles.length - insertedCount;
            
            res.status(207).json({
                message: `${insertedCount} artículos añadidos exitosamente, ${duplicateCount} duplicados omitidos`,
                insertedCount: insertedCount,
                duplicateCount: duplicateCount,
                totalAttempted: articles.length
            });
        } else {
            console.error('Error en bulk insert:', error);
            res.status(500).json({ 
                message: 'Error al añadir los artículos', 
                error: error.message 
            });
        }
    }
};

export const uploadArticleFile = async (req, res) => {
  const { projectId, articleId } = req.params;
  const userId = req.session.userId;
  const filePath = req.file ? req.file.path : null;
  const relativePath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');

  if (!filePath) {
    return res.status(400).json({ message: 'No se recibió ningún archivo.' });
  }

  try {
    let article;
    if (articleId) {
      article = await Article.findOne({ _id: articleId, projectId });
      if (!article) {
        return res.status(404).json({ message: 'Artículo no encontrado.' });
      }
      article.pdfPath = relativePath;
      article.modifiedBy = userId;
      await article.save();
    }
    res.status(200).json({ message: 'Archivo subido y asociado correctamente.', article });
  } catch (error) {
    res.status(500).json({ message: 'Error al asociar el archivo.', error });
  }
};
