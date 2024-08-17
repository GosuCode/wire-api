const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require('bcryptjs');
const {validateToken} = require("../middlewares/Authmiddleware")

const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    // Check if the user already exists in the database
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      // User already exists, send a failure response
      return res.status(400).json({ message: "User already exists" });
    }

    // If the user doesn't exist, proceed with user creation
    bcrypt.hash(password, 10).then((hash) => {
      Users.create({
        username: username,
        password: hash,
        email: email,
      });
      res.json("SUCCESS");
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user with the provided email in the database
    const user = await Users.findOne({ where: { email: email } });

    if (!user) {
      // If user not found, send an error response
      return res.json({ error: "User Doesn't Exist" });
    }

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password).then(async (match) => {
      if (!match) {
        // If passwords don't match, send an error response
        return res.json({ error: "Wrong Username And Password Combination" });
      }

      // If passwords match, generate an access token
      const accessToken = sign(
        { username: user.username, id: user.id, email: user.email, createdAt: user.createdAt  },
        process.env.SECRET_KEY
        // , {expiresIn: '10m'}
      );

      // Send the access token and user details in the response
      res.json({
        token: accessToken,
        username: user.username,
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      });

    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error during user login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user", validateToken, (req, res) => {
  res.json(req.user);
});

router.get("/listOfUsers", async (req, res) => {
  const listOfUsers = await Users.findAll();  //joining posts and likes table
  res.json(listOfUsers);
});

router.get("/userById/:id", async (req, res) => {
  const id = req.params.id;
  const user = await Users.findByPk(id);
  res.json(user);
});

router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;
  await Users.destroy({
    where: {
      id: userId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});


module.exports = router;
