import express from 'express';
import {
  Signup, Login, refreshtoken, verifytokens, Logout, sendotp, otpverification, forgottenpassword
} from '../Controllers/Auth.controller.js';

const router = express.Router();

router.post('/newuser/signup', Signup,sendotp);

router.post('/login', Login,sendotp);

router.get('/refreshtoken', refreshtoken);

router.get('/jwtveryfication', verifytokens, (req, res) => { res.status(200).json({ success: 'jwt is veryfied', user: req.userinfo }); });

router.get('/Logout', verifytokens, Logout);

router.post('/send-otp', sendotp);

router.post('/Otp-verification',otpverification)

router.post('/forgotten-password',verifytokens,forgottenpassword)

export default router;
