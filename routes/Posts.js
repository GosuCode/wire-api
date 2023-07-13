const express = require("express");
const router = express.Router();
const { Posts } = require("../models");

router.get("/", async (req, res) => {
  const listOfPosts = await Posts.findAll();
  res.json(listOfPosts);
});

router.get("/postById/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
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

router.post('/posts', upload.single('image'), async (req, res) => {
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

module.exports = router;
