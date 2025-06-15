import { create } from "connect-mongo";
import mongoose from "mongoose";

export const graphSchema = new mongoose.Schema({
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    configuration: {
        type:{
            type: String,
            enum: ['bar', 'pie', 'line', 'scatter', 'histogram'],
            required: true
        },
        x_axis: {
            fieldId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
            },
            name: String //nombre del eje
        },
        y_axis: {
            fieldId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            name: String //nombre del eje
        },
        filters: {
            visual:{
                colors:[String], //colores en hexadecimales
                height: {type: Number, default: 400},
                width: {type: Number, default: 600},
                showLabels: {type: Boolean, default: true},
                showLegend: {type: Boolean, default: true},

            }
        }

    },

    cache:{
        data: mongoose.Schema.Types.Mixed, // Datos procesados
        svg: String, // SVG generado para exportar
        lastUpdate: Date,
        stats: {
        totalRegistry: Number,
        filteredRegistry: Number,
        category: [String]
        }
    },
    status:{
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
    
},{
    timestamps: true, // createdAt, updatedAt
});

graphSchema.index({ proyectId: 1, createdBy: 1 });
graphSchema.index({ 'configuration.type': 1 });