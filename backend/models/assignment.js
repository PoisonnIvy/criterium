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
    },
    // can be self assigned or by another user
    assignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    status: { 
        type: String, 
        enum: ['asignado','no asignado'], 
        default: 'asignado' 
    },

    assignedAt: { type: Date, default: Date.now },
    completedAt: Date,
    priority: { 
        type: String, 
        enum: ['baja', 'media', 'alta'], 
        default: 'media' 
    },
    priorityBy:{
        type: String
    }
}, {
    timestamps: true,
});

assignmentSchema.index({ articleId: 1}, { unique: true, });
assignmentSchema.index({ assignedTo: 1, status: 1 });
assignmentSchema.index({ projectId: 1, status: 1 });

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;