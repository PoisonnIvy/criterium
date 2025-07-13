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
        enum: ["activo", "completado","deshabilitado"],
        default: "activo",
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
            enum: ['investigador principal','editor', 'colaborador'], 
            required: true
        },
        joinedAt: { type: Date, default: Date.now },
       
    },{ _id : false }],

    screeningCriteria: [String],
}, {
    timestamps: true, //createdAt, updatedAt
});

projectSchema.index({ 'members.userId': 1 });
projectSchema.index({ leaderId: 1 });

// Método que retorna el rol del usuario
projectSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString()
  );
  
  return member ? member.role : null;
};

projectSchema.methods.canEditMembers = function(userId) {
  const role = this.getUserRole(userId);
  return ['investigador principal', 'editor'].includes(role);
};


const Project = mongoose.model("Project", projectSchema);
export default Project;