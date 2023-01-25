/* eslint-disable import/extensions */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import bodyParser from 'body-parser';
import connect from './Connections/mongoos.connection.js';
import './Connections/Cloudinary.connection.js';

import AuthRouter from './routes/AuthRouter.js';
import UserRouter from './routes/user.js';
import PostRouter from './routes/PostRouter.js';
import ChatRouter from './routes/Chat.Router.js';
import CommentRouter from './routes/Comment.Router.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const app = express();
dotenv.config();

app.use(express.json());
app.use(bodyParser({ extends: true }));

try {
  app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
  app.use(cookieParser('dsafhaskdfjsdaklfjsklafjsdfgggsffgsdfddfgdgf'));
} catch (err) {
  console.log(err);
}

app.listen(process.env.PORT, () => {
  connect();
  console.log('Backend connection successfully');
  console.log(`server running in ${process.env.PORT}`);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use('/auth', AuthRouter);
app.use('/user', UserRouter);
app.use('/post', PostRouter);
app.use('/chat', ChatRouter);
app.use('/comment', CommentRouter);
