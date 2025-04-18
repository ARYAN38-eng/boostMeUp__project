import mongoose from "mongoose";
const { Schema, model } = mongoose;

const StatsSchema = new Schema({
  username: { type: String, required: true, unique: true },
  views: { type: Number, required: true }
});

export default mongoose.models.Stats || model("Stats", StatsSchema);
