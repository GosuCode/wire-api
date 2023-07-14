const express = require("express");
const router = express.Router();
const { Posts, Likes } = require("../models");
const { validateToken } = require("../middlewares/Authmiddleware");

router.get("/", async (req, res) => {
  const listOfPosts = await Posts.findAll({include: [Likes]});  //joining posts and likes table
  res.json(listOfPosts);
});

router.get("/postById/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id, {include: [Likes]});
  res.json(post);
});

//setting up a multer to handle the image
const path = require('path');
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
    storage: storage,
    limits : { fileSize: 5000000 },    //image file size limit 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;     //file type that are accepted
        const mimeType = filetypes.test(file.mimetype);   //check if the file type is accepted
        const extname = filetypes.test(path.extname(file.originalname));   //check if the file type is accepted
        //if mimeType = extname upload
        if(mimeType && extname){
            return cb(null, true);
        }
        cb('Error: File upload only supports the following filetypes - ' + filetypes);
    }
})

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const post = req.body;
    const { filename } = req.file;

    await Posts.create({ ...post, image: filename });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/update',validateToken, upload.single('image'), async (req, res) => {
  try {
    const id = req.body.id;
    const updatedPost  = req.body;
    const { filename } = req.file;

    await Posts.update({ ...updatedPost, image: filename }, {where : {id: id}});

    res.status(201).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete("/:postId",validateToken, async (req, res) => {
  const postId = req.params.postId;
  await Posts.destroy({
    where: {
      id: postId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});



module.exports = router;
