import Assignment from '../models/assignment.js';
import Article from '../models/article.js';
import Team from '../models/team.js';



//FUNCION PARA ASIGNAR UN ARTICULO A UN REVISOR(CUALQUIER INTEGRANTE DENTRO DEL TEAM)
/*
    revisar si esto tambien se hará una coleccion por projecto o todo en una misma coleccion
    cambia mucho la logica de crear y actualizar.
*/
export const addAssignment = async (req, res) => {
    const { projectId } = req.params;
    const { reviewerId, articleId } = req.body;

    /*
        const collectionName= `Project_{projectId}_assignments`;
        y para crear en esa coleccion despues como seria?... si no tiene un modelo ._.

    */

    try {
        //falta logica para comprobar que el usuario pertenece al team del projecto D:
        const user = Team.findById();

        const article = Article.findById(articleId);
        if(user && article){
            const assignment = new Assignment(
                projectId,
                reviewerId,
                articleId,
            );
            await newProject.save();
            res.status(200).json(assignment);
        }
        else res.status(400).json({message:"User doesnt belong to this team or the article doesn't exist"})

    } catch (error) {
        res.status(500).json({ message: 'Error adding assignment', error });
    }
}


export const removeAssignment = async (req, res) => {
    const { id } = req.params;
    const { assignmentId } = req.body;

    try {
        
    } catch (error) {
        res.status(500).json({ message: 'Error removing assignment', error });
    }
}