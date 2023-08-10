const express = require("express");
const router = express.Router();
const { Bookmarks, Posts, Users } = require("../models");
const { validateToken } = require("../middlewares/Authmiddleware");

router.post("/", validateToken, async (req, res) => {
  const { PostId } = req.body;
  const UserId = req.user.id;

  const found = await Bookmarks.findOne({
    where: { PostId: PostId, UserId: UserId },
  });

  if (!found) {
    await Bookmarks.create({ PostId: PostId, UserId: UserId });
    res.json({ Bookmarked: true });
  } else {
    await Bookmarks.destroy({
      where: { PostId: PostId, UserId: UserId },
    });
    res.json({ Bookmarked: false });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookmarks = await Bookmarks.findAll({
      include: [
        {
          model: Posts,
        },
      ],
    });

    res.json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

Bookmarks.belongsTo(Posts, { foreignKey: "PostId" });

module.exports = router;
