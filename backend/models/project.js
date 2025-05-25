import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "completed","disabled"],
        default: "active",
    },
    leadInvestigator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    members: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        role: { 
            type: String, 
            enum: ['leader','editor', 'collaborator'], 
            required: true
        },
        joinedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
    }],
    
}, {
    timestamps: true, //createdAt, updatedAt
});

projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ leaderId: 1 });

// Método para verificar permisos
projectSchema.methods.getUserRole = function(userId) {
  // El líder siempre tiene permisos de líder
  if (this.leaderId.toString() === userId.toString()) {
    return 'leader';
  }
  
  // Buscar en miembros activos
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString() && m.isActive
  );
  
  return member ? member.role : null;
};

projectSchema.methods.canEditBaseForm = function(userId) {
  const role = this.getUserRole(userId);
  return ['leader', 'editor'].includes(role);
};


const Project = mongoose.model("Project", projectSchema);
export default Project;