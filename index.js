const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(express.static('./Images'))

const db = require("./models");

// Routers
const postRouter = require("./routes/Posts");
app.use("/posts", postRouter);

const commentsRouter = require("./routes/Comments");
app.use("/comments", commentsRouter);

const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);

const likesRouter = require('./routes/Likes')
app.use("/likes", likesRouter);

const bookmarksRouter = require('./routes/Bookmarks')
app.use("/bookmarks", bookmarksRouter);

const port = process.env.PORT || 3001;
db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log("Server running on port 3001");
  });
});
