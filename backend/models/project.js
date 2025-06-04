import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "Sin descripción",
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
        isActive: { type: Boolean, default: true },
       
    },{ _id : false }],
    
}, {
    timestamps: true, //createdAt, updatedAt
});

projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ leaderId: 1 });

// Método que retorna el rol del usuario
projectSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString() && m.isActive
  );
  
  return member ? member.role : null;
};

projectSchema.methods.canEditMembers = function(userId) {
  const role = this.getUserRole(userId);
  return ['leader', 'editor'].includes(role);
};


const Project = mongoose.model("Project", projectSchema);
export default Project;