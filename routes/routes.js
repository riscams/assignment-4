require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const authenticateJWT = require("../middleware/jwtAuthenticator");
const createNotes = require("../views/create-notes");
const shareNotes = require("../views/share-notes");
const home = require("../views/home");
const signInTemplate = require("../views/signin");
const alreadySignedinTemplate = require("../views/already-signedin");
const signUpTemplate = require("../views/signup");
const { User, Note, NoteSharing } = require("../models");
const { ValidationError } = require("sequelize");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      return res.send("Invalid Username");
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      let token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.JWT_ACCESS_KEY,
        {
          expiresIn: 86400, //24h expired
        }
      );
      res.cookie("auth", token);
      res.send({
        error: 0,
        message: "Note saved Successfully",
        token: token
      });
    } else {
      return res.send("Invalid Password");
    }
  } catch (error) {
    return res.sendStatus(404);
  }
});

router.post("/create-notes", authenticateJWT, async (req, res) => {
  const { title, body, type } = req.body;
  const { id } = req.user;
  try {
    const note = await Note.create({ title, body, type, userId: id });
    res.send({
      error: 0,
      message: "Note saved Successfully",
      data: note,
    });
  } catch (error) {
    console.log(error)
    res.sendStatus(500);
  }
});


router.get("/note/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    const note = await Note.findOne({ where: { id } });
    res.send({
      error: 0,
      message: "Successfully",
      data: note,
    });
    console.log(res)
  } catch (error) {
    console.log(error)
    res.sendStatus(401);
  }
});

router.post("/note/:id", authenticateJWT, async (req, res) => {
  const { sharedUser } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findOne({ where: { username: sharedUser } });

    if (!user) {
      return res.send({ error: 1, message: "User not found" });
    }

    const noteSharing = await NoteSharing.create({
      userId: user.id,
      noteId: id,
    });


    res.send({ error: 0, message: `Shared to ${user.username} successfully` });
  } catch (error) {
    console.log(error)
    res.sendStatus(401);
  }
});

module.exports = router;
