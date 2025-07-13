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
    tags: [String], // Array of tags for categorization (for the user)
    abstract: {
        type:String,
        default:''
    },
    source: {
        type:String,
        default:''
    },
    pdfPath: {
        type:String,
        default:''
    },
    // --------------
    is_oa: {
        type:Boolean,
        default:false
    },
    openAccessURL: {
         type: String, 
         default: '' 
    },
    other_url: [{
            link: String,
            pdfLink: String,
            version: String
        }],
    //- ------- no son obligacion tenerlos, es para referencia
    doi:{
        type:String,
        default: '',
    },
    doiUrl: {
        type: String,
        default:''
    },
    otherIdentifiers: {
        pmid: {type: String, default:''},
        arxivId: {type: String, default:''},
        isbn: {type: String, default:''},
        handle: {type: String, default:''},
        customId: {type: String, default:''},
        otherId:{type: String, default:''},    
    },
    publicationType: {
        type: String,
        default: 'no especificado'
    },
    year: {type: Number, default:''},
    volume: {
        type:String,
        default:''
    },
    issue: {
        type:String,
        default:''
    },
    pages: {
        type:String,
        default:''
    },
    keywords: [String],
    authors: [{
        name: { type: String, required: true },
        affiliation: String,
        orcid: String
    }],
    journal: {
        type:String,
        default:''
    }, // revista o publicacion donde está el articulo
    publisher: {
        type:String,
        default:''
    }, //editorial de la revista  publicacion 
    referenceCount: {
        type: Number,
        default:0
    }, // a cuantos articulos hace referencia el articulo
    citationCount: {
        type: Number,
        default:0
    }, //cuantas veces ha sido citado el articulo en otros articulos
    language: [{
        type: String,
        default:'',
    }],

///status para el cribado
    status: { 
        type: String, 
        enum: ['pendiente','aceptado','descartado'], 
        default: 'pendiente' 
    },
    criteriaNotes:{
        type: String,
        default: ''
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