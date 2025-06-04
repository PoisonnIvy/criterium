import mongoose from "mongoose";

const baseFormSchema = new mongoose.Schema({
    fields: [{
        type: { 
            type: String, 
            enum: ['text', 'textarea', 'number', 'select', 'multiselect', 'boolean', 'date'],
            required: true 
        },
        enabled: { 
            type: Boolean, 
            default: true
        },
        options:{
            type: [String],
            required: true,
        }, // Para select/multiselect
        placeholder: String,
        helpText: String,
    }],
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
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
    unique:{
        type: Boolean,
        default: false,
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
baseFormSchema.index({ projectId: 1, unique: 1 }, { 
  unique: true, 
  partialFilterExpression: { unique: true } 
});

const BaseForm = mongoose.model("BaseForm", baseFormSchema);
export default BaseForm;