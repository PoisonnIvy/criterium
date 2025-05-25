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
    isOA: {
        type: Boolean,
        default: false,
        required: true
         
    },
    metadata: {
        year: Number,
        journal: String,
        volume: String,
        issue: String,
        pages: String,
        doi: String,
        keywords: [String],
        authors: [{
        name: String,
        }]
    },
    abstract: String,
    url: String,
    source: String,

    status: { 
        type: String, 
        enum: ['pending', 'assigned', 'in_progress', 'completed', 'reviewed'], 
        default: 'pending' 
    },
    addedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, {
    timestamps: true, // createdAt, updatedAt
});

articleSchema.index({ projectId: 1, status: 1 });
articleSchema.index({ projectId: 1, createdAt: -1 });

const Article = mongoose.model("Article", articleSchema);
export default Article;