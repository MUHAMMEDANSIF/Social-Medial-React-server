import mongoose, { Schema } from 'mongoose';

const PostSchema = mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId, ref: 'user',
  },
  posturl: String,
  postid: String,
  discription: String,
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
      },
      likedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  comments: {
    type: Schema.Types.ObjectId, ref: 'comment',
  },
  shares: [
    {
      sharefrom: String,
      shareto: String,
      time: Date,
    },
  ],
}, { timestamps: true });

export default mongoose.model('post', PostSchema);
