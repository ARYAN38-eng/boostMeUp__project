import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String},
    desc: {type: String},
    username: { type: String, required: true, unique:true },
    profilepic: {type: String, default: null},
    coverpic: {type: String, default: null},
    razorpayid: { type: String },
    razorpaysecret: { type: String },
    creator: { type: Boolean},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    genre: {type: String}
    });

export default mongoose.models.User || model("User", UserSchema);