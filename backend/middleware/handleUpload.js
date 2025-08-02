import multer from 'multer';
import { limits, storage, fileFilter } from '../config/multer.js'


const upload = multer({
    storage: multer.diskStorage(storage),
    fileFilter,
    limits,
});


export default upload;