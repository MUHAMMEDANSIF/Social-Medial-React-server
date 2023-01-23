import mongoose from 'mongoose';
import commentSchema from '../model/comment.modal.js';

export const getAllComments = async (req, res) => {
  const userid = req.userinfo._id;
  console.log(userid)

  if (req.params) {
    const response = await commentSchema.aggregate([
      {
        $match: {
          postid: req.params.postid,
          parent: req.params.parent,
        },
      },
      {
        $addFields: {
          liked: {
            $cond: {
              if: {
                $in: [mongoose.Types.ObjectId(userid), '$likes.user'],
              },
              then: true,
              else: false,
            },
          },
          likescount: {
            $size: '$likes',
          },
        },
      },
      {
        $sort:{
          createdAt: -1,
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: '$users',
      },
    ]);
    console.log(response)
    res.json({ success: true, comments: response });
  } else {
    res.json({ error: 'params is not found' });
  }
};

export const addnewcomment = async (req, res) => {
  const userid = req.userinfo._id;
  try {
    if (req.body) {
      req.body.userid = userid;
      const newcomment = await commentSchema(req.body);
      const response = await newcomment.save();

      const comment = await commentSchema.aggregate([
        {
          $match: {
            _id:response._id
          },
        },
        {
          $addFields: {
            liked: {
              $cond: {
                if: {
                  $in: [mongoose.Types.ObjectId(userid), '$likes.user'],
                },
                then: true,
                else: false,
              },
            },
            likescount: {
              $size: '$likes',
            },
          },
        },
        {
          $sort:{
            createdAt: -1,
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userid',
            foreignField: '_id',
            as: 'users',
          },
        },
        {
          $unwind: '$users',
        },
      ]);
      console.log(comment)
      res.json({ success: true, comments: comment[0] });
    } else {
      res.json({ error: 'No data found' });
    }
  } catch (err) {
    console.log(err);
    res.json({ error: err.message });
  }
};

export const Commentlike = async (req, res) => {
  try {
    if (req.body) {

      if (req.body.liked) {
       const response = await commentSchema.findByIdAndUpdate(req.body._id, {
          $pull: {
            likes: {
              user: req.body.commentuserid,
            },
          },
        });
      } else {
       const response = await commentSchema.findByIdAndUpdate(req.body._id, {
          $push: {
            likes: {
              user: req.body.commentuserid,
            },
          },
        });
      }
      res.status(200).json({ success: true });
    } else {
      res.json({ error: 'data not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

export const deletecomment = async (req,res) => {
    try{
        const userid = req.userinfo._id;
        const id = req.body.id;
        const response = await commentSchema.findByIdAndDelete(id)
        console.log(response);
        const comments = await commentSchema.aggregate([
            {
              $match: {
                postid:response.postid,
                parent:response.parent
              },
            },
            {
              $addFields: {
                liked: {
                  $cond: {
                    if: {
                      $in: [mongoose.Types.ObjectId(userid), '$likes.user'],
                    },
                    then: true,
                    else: false,
                  },
                },
                likescount: {
                  $size: '$likes',
                },
              },
            },
            {
              $sort:{
                createdAt: -1,
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userid',
                foreignField: '_id',
                as: 'users',
              },
            },
            {
              $unwind: '$users',
            },
          ]);
        
         res.json({success:true,comments:comments})

    }catch(err) {
        console.log(err);
        res.json({error:err.message})
    }
}
