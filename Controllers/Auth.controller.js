/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import rn from 'random-number';
import userSchema from '../model/user.model.js';

export const Signup = async (req, res, next) => {
  try {
    const data = req.body;
    const { email } = req.body;
    data.password = await bcrypt.hash(data.password, 10);

    const user = await userSchema(data);

    await user.save();
    req.email = email;
    next();
  } catch (err) {
    res.json({
      error: 'Signup is failed please try again',
      message: Object.keys(err.keyValue),
    });
  }
};

export const Login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userSchema.findOne({ username });
    if (user) {
      if (!user.emailverified) {
        req.email = user.email;
        next();
      } else {
        const password_checking = await bcrypt.compare(
          password,
          user.password,
        );
        if (password_checking) {
          const posts = user.posts ? user.posts.length : 0;
          const workat = user.workat
            ? user.workat
            : 'please add work informaion';
          const livesin = user.livesin
            ? user.livesin
            : 'please add your place and details';
          const status = user.status
            ? user.status
            : 'please add your status';
          const data = {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.length,
            posts,
            workat,
            livesin,
            status,
          };
          const accessToken = jwt.sign(
            data,
            process.env.ACCESS_TOKEN_SECRET_KEY,
            { expiresIn: '1m' },
          );
          const refreshtoken = jwt.sign(
            data,
            process.env.REFRESH_TOKEN_SECRET_KEY,
            { expiresIn: '1d' },
          );

          res.cookie('refreshtoken', refreshtoken, {
            sameSite: 'none',
            domain: process.env.CLIENT_URL,
            path: '/',
            maxAge: 3600000 * 24,
            httpOnly: false,
            secure: true,
          })
            .cookie('accesstoken', accessToken, {
              sameSite: 'none',
              domain: process.env.CLIENT_URL,
              path: '/',
              maxAge: 3600000 * 24,
              httpOnly: false,
              secure: true,
            })
            .json({
              success: 'Login success',
              jwt: accessToken,
            });
        } else {
          res.json({
            error: 'Password is incorrect Please try again',
          });
        }
      }
    } else {
      res.json({
        error: 'No user found please Singup',
      });
    }
    await userSchema.findOneAndUpdate(
      { username },
      {
        $set: {
          presence: true,
        },
      },
    );
  } catch (err) {
    res.json({
      erroror: 'Some technical Problem Please try after some time we will fix it', error: err.message,
    });
  }
};

export const refreshtoken = (req, res) => {
  try {
    if (req.cookies.refreshtoken) {
      jwt.verify(
        req.cookies.refreshtoken,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        (err, done) => {
          if (err) {
            res.status(498).json({
              error: 'refresh token is not valid',
            });
          } else {
            delete done.iat;
            delete done.exp;
            const accessToken = jwt.sign(
              done,
              process.env.ACCESS_TOKEN_SECRET_KEY,
              {
                expiresIn: '1m',
              },
            );
            const refreshtokens = jwt.sign(
              done,
              process.env.REFRESH_TOKEN_SECRET_KEY,
              {
                expiresIn: '1d',
              },
            );

            res.cookie('refreshtoken', refreshtokens, {
              sameSite: 'strict',
              path: '/',
              maxAge: 3600000 * 24,
              httpOnly: true,
              secure: true,
            })
              .cookie('accesstoken', accessToken, {
                sameSite: 'strict',
                path: '/',
                maxAge: 3600000 * 24,
                httpOnly: true,
                secure: true,
              })
              .status(200)
              .json({
                message: 'token refreshed',
              });
          }
        },
      );
    } else {
      res.status(498).json({
        error: 'refreshtoken is not found',
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const verifytokens = (req, res, next) => {
  try {
    if (req.cookies.accesstoken) {
      jwt.verify(
        req.cookies.accesstoken,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        (err, done) => {
          if (err) {
            const { message } = err;
            if (message === 'jwt expired') {
              res.status(401).json({
                status: 'jwt expired',
              });
            } else {
              res.status(401).json({
                error: 'jwt is not valid',
              });
            }
          } else {
            req.userinfo = done;
            next();
          }
        },
      );
    } else {
      res.json({ error: 'jwt is not valid' });
    }
  } catch (err) {
    console.log(err);
  }
};

export const Logout = async (req, res) => {
  try {
    res.clearCookie('accesstoken')
      .clearCookie('refreshtoken')
      .json({ success: 'cookie cleraed' });

    const userid = req.userinfo._id;

    await userSchema.findOneAndUpdate(
      { _id: userid },
      {
        $set: {
          lastSeenAt: Date(Date.now()),
          presence: false,
        },
      },
    );
  } catch (err) {
    console.log(err.message);
  }
};

export const sendotp = async (req, res) => {
  try {
    let email;
    if (req.email) {
      email = req.email;
      console.log(email);
    } else {
      email = req.body.email;
      console.log(req.body);
    }

    const email_checking = await userSchema.findOne({ email });
    if (email_checking) {
      const options = {
        min: 100000,
        max: 999999,
        integer: true,
      };
      const Otp = rn(options);
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'buildyourfuture36@gmail.com', // generated ethereal user
          pass: process.env.NODE_MAILER_PASSWORD, // generated ethereal password
        },
      });

      // send mail with defined transport object
      const info = {
        from: 'buildyourfuture36@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${process.env.APPLICATION_NAME}</a></div><p style="font-size:1.1em">Hi,</p><p>Thank you for choosing ${process.env.APPLICATION_NAME}. Use the following OTP to complete your vefification procedures. OTP is valid for 5 minutes</p><h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${Otp}</h2><p style="font-size:0.9em;">Regards,<br />Your Brand</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>${process.env.APPLICATION_NAME} Inc</p><p>1600 Amphitheatre Parkway</p><p>California</p></div></div></div>`, // html body
      };

      transporter.sendMail(info, async (error) => {
        if (error) {
          console.log('error');
          console.log(error);
          res.json({ error: true });
        } else {
          const salt = await bcrypt.genSalt();
          const secureOTP = await bcrypt.hash(Otp.toString(), salt);
          const verificationToken = jwt.sign(
            { OTP: secureOTP, Email: email },
            process.env.VERIFICATION_TOKEN_SECRET_KEY,
            { expiresIn: '5m' },
          );

          res.status(200).cookie('verificationToken', verificationToken, {
            sameSite: 'strict',
            path: '/',
            maxAge: 1000 * 60 * 60 * 60 * 60,
            httpOnly: true,
            secure: true,
          }).json({ success: true, email });
        }
      });
    } else {
      res.json({ error: 'This Email is not found Please try a valid email address' });
    }
  } catch (err) {
    console.log(err);
  }
};

export const otpverification = async (req, res) => {
  try {
    const check_Otp = req.body.OTP;
    const Otp_inToken = req.cookies.verificationToken;
    console.log(Otp_inToken);

    jwt.verify(Otp_inToken, process.env.VERIFICATION_TOKEN_SECRET_KEY, async (err, done) => {
      if (done) {
        console.log(done);
        const otp_validation = await bcrypt.compare(check_Otp, done.OTP);
        console.log(otp_validation);
        if (otp_validation) {
          userSchema.findOneAndUpdate({ email: done.Email }, {
            $set: {
              emailverified: true,
            },
          }, (error, result) => {
            console.log(result);
            if (error) res.json({ error: err });
            res.json({ success: true });
          });
        } else {
          res.json({ error: 'OTP incorrect' });
        }
      } else if (err.message === 'jwt expired') {
        res.json({ error: 'jwt expired' });
      } else {
        res.json({ error: err });
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
};

export const forgottenpassword = async (req, res) => {
  try {
    if (req.body.password || req.body.email) {
      let { password } = req.body;
      password = await bcrypt.hash(password, 10);
      const { email } = req.body;

      const password_reset = await userSchema.findOneAndUpdate({ email }, {
        $set: {
          password,
        },
      });
      if (password_reset) {
        res.json({ success: true });
      } else {
        res.json({ error: 'password changing proccess is failed' });
      }
    } else {
      res.json({ error: 'Password is not Found' });
    }
  } catch (err) {
    console.log(err);
    res.json({ error: err });
  }
};
