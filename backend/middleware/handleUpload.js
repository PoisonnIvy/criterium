import multer from 'multer';
import { limits, storage, fileFilter } from '../config/multer.js'


const upload = multer({
    storage,
    fileFilter,
    limits,
});


export default upload;