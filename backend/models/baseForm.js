import mongoose from "mongoose";

const baseFormSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    //por projecto
    active:{
        type: Boolean,
        default: true
    },
    fields: [{
        type: { 
            type: String, 
            enum: ['textarea', 'number', 'select', 'multiselect', 'boolean', 'date'],
            required: true 
        },
        label:{
            type:String,
            default:'Sin nombre'
        },
        enabled: { 
            type: Boolean, 
            default: true
        },
        options:{
            type: [String],
        }, // Para select/multiselect
        helpText: String,
    }],
    
    //cada vez que se edite el formulario base se tiene que 
    //cambiar el status y el estado de isActive para evitar ediciones simultaeneas
    //cada vez que se edite se cambia el numero de version y se guarda el id del ultimo que editó
    status: {
        type: String,
        enum: ["editing", "free"],
        default: "free",
    },
    
    isActive: {
        type: Boolean,
        default: true,
        //true para libre, false para bloqueado (editando)
    },
    version: {
        type: Number,
        default: 1,
    },
    
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    comments:[{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["pendiente", "resuelto"],
            default: "pendiente",
        },
    }]
});
baseFormSchema.index({ projectId: 1 }, { unique: true });
baseFormSchema.index({ "comments._id": 1 });
const BaseForm = mongoose.model("BaseForm", baseFormSchema);
export default BaseForm;