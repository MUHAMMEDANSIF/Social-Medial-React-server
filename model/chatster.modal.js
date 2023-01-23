import mongoose, { Schema } from 'mongoose';

const chatsterSchema = mongoose.Schema({
  user: String,
  chatsters: [
    {
      personid: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      lastUpdatedAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

export default mongoose.model('chatster', chatsterSchema);
