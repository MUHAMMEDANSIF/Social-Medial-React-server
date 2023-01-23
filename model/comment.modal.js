import mongoose, { Schema } from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    postid: String,
    userid: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    text: String,
    likes: [
      {
        user: Schema.Types.ObjectId,
        likedAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    parent: {
      type: String,
    }
  },
  { timestamps: true },
);

export default mongoose.model('comment', commentSchema);
