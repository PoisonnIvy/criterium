import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
        required: true,
    },
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // can be self assigned or by another user
    assignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
  
    status: { 
        type: String, 
        enum: ['active', 'completed', 'cancelled'], 
        default: 'active' 
    },

    assignedAt: { type: Date, default: Date.now },
    completedAt: Date,
    notes: String,
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    }
}, {
    timestamps: true,
});

assignmentSchema.index({ articleId: 1, status: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: 'active' } 
});
assignmentSchema.index({ assignedTo: 1, status: 1 });
assignmentSchema.index({ projectId: 1, status: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;