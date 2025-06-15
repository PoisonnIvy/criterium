import mongoose from "mongoose";    

const articleSchema = new mongoose.Schema({
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    tags: [String], // Array of tags for categorization
    abstract: String,
    source: String, //web or pdf
    pdfPath: String,
    OA_URL: String, // Open Access URL
    doi:{
        type:String,
        required: true,
        default: '',
    },
    doiUrl: {
        type: String,
    },
    otherIdentifiers: {
        pmid: String,
        arxivId: String,
        isbn: String,
        handle: String,
        customId: String
    },
    publicationType: {
        type: String,
        enum: ['journal', 'conference', 'book', 'report', 'thesis', 'other'],
        default: 'journal'
    },
    metadata: {
        year: Number,
        volume: String,
        issue: String,
        pages: String,
        keywords: [String],
        authors: [{
            name: { type: String, required: true },
            affiliation: String,
            orcid: String
        }],
        journal: String,
        publisher: String,
        citationCount: Number,
        language: [String],
    },
///status para el cribado
    status: { 
        type: String, 
        enum: ['pendiente','aceptado','descartado'], 
        default: 'pendiente' 
    },
    addedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    modifiedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

articleSchema.index({ projectId: 1, status: 1 });
articleSchema.index({ projectId: 1, createdAt: -1 });
articleSchema.index({ projectId: 1, doi: 1 }, { unique: true });

const Article = mongoose.model("Article", articleSchema);
export default Article;