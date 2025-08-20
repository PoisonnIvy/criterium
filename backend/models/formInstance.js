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
        required: true, 
        unique: true
    },
    baseFormId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BaseForm', 
        required: true 
    },
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Assignment', 
        required: true 
    },
    
    data: [{
        fieldId: { 
            type: mongoose.Schema.Types.ObjectId,
        },
        value: mongoose.Schema.Types.Mixed, 
        extractedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        enabled: { 
            type: Boolean, 
            default: true
        },
        notes: String,
    }],
    analysisStatus: { 
        type: String, 
        enum: ['pendiente', 'en curso', 'completado'], 
        default: 'pendiente' 
    },
    completionPercentage: { 
        type: Number, 
        default: 0 
    },
    completedAt: Date,
}, {
    timestamps: true, //createdAt, updatedAt 
}); 

formInstanceSchema.index({ projectId: 1, baseFormId:1});
formInstanceSchema.index({ projectId: 1, assignmentId: 1 });
formInstanceSchema.index({ projectId: 1, analysisStatus: 1 });
formInstanceSchema.index({ projectId: 1, _id:1});

formInstanceSchema.methods.updateProgress = function() {
  const totalFields = this.data.filter(d => d.enabled).length;
  const completedFields = this.data.filter(d => d.value !== null && d.value !== undefined && d.value !== '' && d.enabled === true).length;
  this.completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

};
formInstanceSchema.methods.markAsCompleted = function() {
  this.analysisStatus = 'completado';
  this.completedAt = new Date();
};

const FormInstance = mongoose.model("FormInstance", formInstanceSchema);
export default FormInstance;