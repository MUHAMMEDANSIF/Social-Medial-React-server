import mongoose, { Schema } from 'mongoose';

const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
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
    workat: String,
    livesin: String,
    status: String,
    bio: {
      type: String,
      default: 'I am a Social media user',
    },
    followers: [
      {
        followerid: {
          type: Schema.Types.ObjectId, ref: 'user',
        },
      },
    ],
    following: [
      {
        followerid: {
          type: Schema.Types.ObjectId, ref: 'user',
        },
      },
    ],
    profile: {
      profileurl: {
        type: String,
      },
      profileid: {
        type: String,
      },
    },
    lastSeenAt: Date,
    emailverified: {
      type: Boolean,
      default: false,
    },
    access: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('user', userSchema);
