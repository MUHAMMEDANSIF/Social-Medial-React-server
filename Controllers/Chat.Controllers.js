/* eslint-disable no-underscore-dangle */
import ChatSterSchema from '../model/chatster.modal.js';
import MessageSchema from '../model/chatmessage.modal.js';

export const allchatster = async (req, res) => {
  try {
    const user = req.userinfo;
    const userid = req.userinfo._id;
    const chatsteres_list = await ChatSterSchema.findOne({
      user: userid,
    }).populate('chatsters.personid');
    if (chatsteres_list) {
      res.status(200).json({
        success: true,
        chatsteres: chatsteres_list,
        user,
      });
    } else {
      res.status(200).json({ status: 'You have No message yet' });
    }
  } catch (err) {
    console.log(err);
  }
};

export const addnewchatster = async (req, res) => {
  try {
    const userid = req.userinfo._id;
    const { chatster } = req.body;

    await ChatSterSchema.findOneAndUpdate(
      { user: userid, 'chatsters.personid': { $ne: chatster } },
      {
        $push: {
          chatsters: {
            personid: chatster,
          },
        },
      },
      {
        upsert: true,
      },
    );

    await ChatSterSchema.findOneAndUpdate(
      { user: chatster, 'chatsters.personid': { $ne: userid } },
      {
        $push: {
          chatsters: {
            personid: userid,
          },
        },
      },
      {
        upsert: true,
      },
    );
    const chatsteres_list = await ChatSterSchema.findOne({
      user: userid,
    }).populate('chatsters.personid');

    res.status(200).json({ success: true, Chatsters: chatsteres_list });
  } catch (err) {
    console.log(err);
  }
};

export const getallmessages = async (req, res) => {
  try {
    const { currentUser, currentchatster } = req.body;

    const response = await MessageSchema.find({
      $or: [
        { senderId: currentUser, receiverid: currentchatster },
        { senderId: currentchatster, receiverid: currentUser },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, message: response });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
};

export const addNewchat = async (req, res) => {
  try {
    const data = req.body;
    const message = await MessageSchema(data);
    const response = await message.save();
    if (response) {
      res.json({ success: true });
    } else {
      res.json({ error: true });
    }
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
};
