import express from "express";
const router = express.Router();
import {verifytokens} from '../Controllers/Auth.controller.js'
import {getAllComments ,addnewcomment, Commentlike, deletecomment} from '../Controllers/Comment.Controller.js'

router.get('/get-All-comments/:postid?/:parent?',verifytokens,getAllComments);

router.post('/add-new-comment',verifytokens,addnewcomment)

router.put('/comment-like',verifytokens,Commentlike)

router.post('/delete-comment',verifytokens, deletecomment)

export default router;
