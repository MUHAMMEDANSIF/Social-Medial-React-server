import mongoose, { Schema } from 'mongoose';

const chatMessageSchema = mongoose.Schema(
  {
    senderId: String,
    receiverid: String,
    text: String,
  },
  { timestamps: true },
);

export default mongoose.model('chatmessage', chatMessageSchema);
