const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
const {validateToken} = require("../middlewares/Authmiddleware")

router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;
  const comments = await Comments.findAll({ where: { PostId: postId } });
  res.json(comments);
});

router.get("/", async (req, res) => {
  const listOfComments = await Comments.findAll();
  res.json(listOfComments);
});

router.post("/", validateToken, async (req, res) => {
  const comment = req.body;
  const username = req.user.username;    //storing username
  comment.username = username;
  await Comments.create(comment);
  res.json(comment);
});

router.delete("/:commentId", validateToken, async (req, res) => {
  const commentId = req.params.commentId;

  await Comments.destroy({
    where: {
      id: commentId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});

module.exports = router;
