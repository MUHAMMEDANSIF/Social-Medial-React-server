import express from 'express';
import { verifytokens } from '../Controllers/Auth.controller.js';
import {
  allchatster,
  addnewchatster,
  getallmessages,
  addNewchat,
} from '../Controllers/Chat.Controllers.js';

const router = express.Router();

router.get('/allchatsters', verifytokens, allchatster);

router.post('/add-new-chatster', verifytokens, addnewchatster);

router.post('/get-messages', verifytokens, getallmessages);

router.post('/add-new-message', verifytokens, addNewchat);

export default router;
