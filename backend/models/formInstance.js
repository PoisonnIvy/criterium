import mongoose from "mongoose";

const formInstanceSchema = new mongoose.Schema({    
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    articleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Article', 
        required: true 
    },
    baseFormId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BaseForm', 
        required: true 
    },
    
    data: [{
        fieldId: { type: String, required: true },
        value: mongoose.Schema.Types.Mixed, 
        extractedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        notes: String,
    }],
    analysisStatus: { 
        type: String, 
        enum: ['not_started', 'in_progress', 'completed'], 
        default: 'not_started' 
    },
    completionPercentage: { 
        type: Number, 
        default: 0 
    },
    completedAt: Date,
}, {
    timestamps: true, //createdAt, updatedAt
}); 

formInstanceSchema.index({ articleId: 1 }, { unique: true });
formInstanceSchema.index({ projectId: 1, analysisStatus: 1 });

formInstanceSchema.methods.updateProgress = function() {
  const totalFields = this.data.length;
  const completedFields = this.data.filter(d => d.value !== null && d.value !== undefined && d.value !== '').length;
  this.completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

};
formInstanceSchema.methods.markAsCompleted = function() {
  this.analysisStatus = 'completed';
  this.completedAt = new Date();
};

const FormInstance = mongoose.model("FormInstance", formInstanceSchema);
export default FormInstance;