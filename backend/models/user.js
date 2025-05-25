import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({   
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    }],
    contributor:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },

});

UserSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});


const User = mongoose.model("User", UserSchema);
export default User;


