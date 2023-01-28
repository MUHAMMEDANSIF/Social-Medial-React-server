import mongoose from 'mongoose';

const chatMessageSchema = mongoose.Schema(
  {
    chatId: String,
    senderId: String,
    receiverid: String,
    text: String,
    unread: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('chatmessage', chatMessageSchema);
