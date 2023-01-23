/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import Userschema from '../model/user.model.js';

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

export const home = async (req, res) => {
  try {
    res.json({ success: 'success', user: req.userinfo });
  } catch (err) {
    console.log(err.message);
  }
};

export const editprofile = async (req, res) => {
  try {
    const id = req.userinfo._id;
    const data = req.body;
    const user = await Userschema.findOne({ _id: id });
    const password_checking = await bcrypt.compare(
      data.password,
      user.password,
    );
    if (password_checking) {
      const updateuser = await Userschema.updateOne(
        { _id: id },
        {
          $set: {
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            email: data.email,
            bio: data.bio,
          },
        },
      );
      if (updateuser.acknowledged) {
        let afterupdate = await Userschema.findById(id);
        const post = updateuser.post ? updateuser.post.length : 0;
        const followers = updateuser.followers
          ? updateuser.followers.length
          : 0;
        const following = updateuser.following
          ? updateuser.following.length
          : 0;
        const workat = user.workat ? user.workat : 'please add work informaion';
        const livesin = user.livesin
          ? user.livesin
          : 'please add your place and details';
        const status = user.status ? user.status : 'please add your status';

        afterupdate = {
          _id: afterupdate._id,
          firstname: afterupdate.firstname,
          lastname: afterupdate.lastname,
          username: afterupdate.username,
          email: afterupdate.email,
          bio: afterupdate.bio,
          post,
          followers,
          following,
          workat,
          livesin,
          status,
        };

        const accessToken = jwt.sign(
          afterupdate,
          process.env.ACCESS_TOKEN_SECRET_KEY,
          { expiresIn: '1m' },
        );
        const refreshtoken = jwt.sign(
          afterupdate,
          process.env.REFRESH_TOKEN_SECRET_KEY,
          { expiresIn: '1d' },
        );

        res
          .cookie('refreshtoken', refreshtoken, {
            sameSite: 'strict',
            path: '/',
            expires: new Date(new Date().getTime() + 100 * 1000),
            httpOnly: true,
            secure: true,
          })
          .cookie('accesstoken', accessToken, {
            sameSite: 'strict',
            path: '/',
            expires: new Date(new Date().getTime() + 100 * 1000),
            httpOnly: true,
            secure: true,
          })
          .json({ success: 'Login success', user: afterupdate });
      } else {
        res.json({ error: 'updation is failed' });
      }
    } else {
      res.json({ error: 'Password not correct' });
    }
  } catch (err) {
    res.json({ error: 'Some error find please try again' });
  }
};

export const editpersonalinformation = (req, res) => {
  try {
    console.log(req.body);
  } catch (err) {
    res.json({ error: 'Some tecnical error find' });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const User = await Userschema.findById(req.userinfo._id);
    const alluser = await Userschema.find({ _id: { $ne: [req.userinfo._id] } });
    console.log(User);
    console.log('User');
    res.status(200).json({ success: true, AllUser: alluser, following: User.following });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });

const uploadToCloudinary = async (localFilePath) => {
  try {
    const mainFolderName = 'main';

    const filePathOnCloudinary = `${mainFolderName}/${localFilePath}`;

    const result = await cloudinary.uploader.upload(localFilePath, {
      public_id: filePathOnCloudinary,
    });

    if (result) return result;
    return false;
  } catch (err) {
    console.log(err);
    return err;
  }
};

export const updateprofile = async (req, res) => {
  try {
    let locaFilePath;
    if (req.file) {
      console.log(req.file);
      locaFilePath = req.file.path;
    } else {
      console.log('file not found');
      res.json({ error: 'file not found' });
    }

    const file = await uploadToCloudinary(locaFilePath);
    console.log(file);
    if (file.public_id) {
      const response = await Userschema.findByIdAndUpdate(req.userinfo._id, {
        $set: {
          profile: {
            profileurl: file.secure_url,
            profileid: file.public_id,
          },
        },
      });
      console.log(response);
      res.json({
        success: 'profile uploading is successfully finished',
        user: response,
      });
    } else {
      res.json({ error: 'file uploading is failed pelase try again' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

export const followrequestsend = async (req, res) => {
  try {
    const userid = req.userinfo._id;
    const { followerid } = req.body;

    console.log(userid);

    const following = await Userschema.findByIdAndUpdate(userid, {
      $push: {
        following:
          {
            followerid,
          },
      },
    });

    const followers = await Userschema.findByIdAndUpdate(followerid, {
      $push: {
        followers:
          {
            followerid: userid,
          },
      },
    });

    if (followers && following) {
      res.json({ success: true });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

export const getallfollower = async (req, res) => {
  try {
    const userid = req.userinfo._id;
    console.log(req.params.follower);
    const followers = await Userschema.findById(userid).select(req.params.follower).populate(`${req.params.follower}.followerid`);
    console.log(followers);
    if (req.params.follower === 'following') {
      res.status(200).json({ success: true, followers: followers.following });
    } else {
      res.status(200).json({ success: true, followers: followers.followers });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
