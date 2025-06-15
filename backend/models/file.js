import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number, // Size in bytes
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

const File = mongoose.model('File', fileSchema);
export default File;