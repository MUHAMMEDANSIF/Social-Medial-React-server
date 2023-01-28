/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
import { v4 as randomId } from 'uuid';
import ChatSterSchema from '../model/chatster.modal.js';
import MessageSchema from '../model/chatmessage.modal.js';

export const allchatster = async (req, res) => {
  try {
    const user = req.userinfo;
    const userid = req.userinfo._id;

    const chatsteres_list = await ChatSterSchema.findOne({
      user: userid,
    })
      .populate('chatsters.personid')
      .sort({ createdAt: -1 });
    if (chatsteres_list) {
      // eslint-disable-next-line max-len
      const chatstersid = chatsteres_list.chatsters.map((element) => element.personid._id.toString());

      const messagesortorder = await MessageSchema.aggregate([
        {
          $match: {
            $or: [
              { senderId: { $in: chatstersid }, receiverid: userid },
              { receiverid: { $in: chatstersid }, senderId: userid },
            ],
          },
        },
        {
          $group: {
            _id: '$chatId',
            maxDate: { $max: '$createdAt' },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      res.status(200).json({
        success: true,
        chatsteres: chatsteres_list,
        user,
        order: messagesortorder,
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
    const chatId = randomId();
    console.log(chatId);
    await ChatSterSchema.findOneAndUpdate(
      { user: userid, 'chatsters.personid': { $ne: chatster } },
      {
        $push: {
          chatsters: {
            chatId,
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
            chatId,
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
