import multer from 'multer';
import path from 'path';
import fs from 'fs';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/articles');

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `article-${uniqueSuffix}${extension}`);
    }
});


const fileFilter = (req, file, cb) => {
    if (file.mimetype in ['application/pdf']) {
        console.log("El archivo tiene la extension correcta")
        cb(null, true)
    } else {
        console.log("El archivo tiene otra extension y no se permite")
        cb(new Error({message:'Solo se permiten archivos con las siguientes extensiones: PDF, CSV, JSON'}), false)
    }
};

export default upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
    }
});