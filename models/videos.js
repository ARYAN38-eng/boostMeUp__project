// /models/video.js
import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  creator: String,
  name: String,
  fileSize: String,
  videoUrl: String,
  uploadedAt: Date,
});

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);
