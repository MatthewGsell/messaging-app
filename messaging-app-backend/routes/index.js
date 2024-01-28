var express = require("express");
var router = express.Router();
const asynchandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../database-models/users");
const Server = require("../database-models/servers");
const DirectMessage = require("../database-models/message");
const jwt = require("jsonwebtoken");
const authorizeuser = require("../authorizeuser");

/* GET home page. */
router.get("/", authorizeuser, function (req, res, next) {
  res.json("authorized");
});

router.post(
  "/signup",
  asynchandler(async (req, res) => {
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    const isDuplicate = await User.findOne({ username: req.body.username });
    if (isDuplicate == null) {
      const user = new User({
        username: req.body.username,
        password: hashedpassword,
      });
      await user.save();
      res.json(200);
    } else {
      res.json("duplicate");
    }
  })
);
router.post(
  "/login",
  asynchandler(async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (user != null) {
      const passwordvalidated = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordvalidated === true) {
        const token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
          expiresIn: "24hr",
        });
        res.cookie("usertoken", token, {
          httpOnly: true,
        });
        res.json("correct");
      } else {
        res.clearCookie("usertoken");
        res.json("incorrect");
      }
    } else {
      res.clearCookie("usertoken");
      res.json("incorrect");
    }
  })
);

router.get(
  "/servers",
  authorizeuser,
  asynchandler(async (req, res) => {
    const user = await User.findOne({ username: req.user.username });
    const serverlist = await Server.find({ _id: { $in: user.servers } });
    let listtosend = [];

    serverlist.forEach((item) => {
      listtosend.push({
        id: item._id,
        name: item.name,
      });
    });
    res.json(listtosend);
  })
);

router.get(
  "/message",
  authorizeuser,
  asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    let listtosend = [];
    const messages = await DirectMessage.find({
      _id: { $in: user.messages },
    });
    for (let i = 0; i < messages.length; i++) {
      let otheruser = "";
      if (messages[i].users[0] === req.user._id) {
        otheruser = messages[i].users[1];
      } else {
        otheruser = messages[i].users[0];
      }
      const otheruserobject = await User.findById(otheruser);
      listtosend.push({
        otheruser: otheruserobject.username,
        messages: messages[i].messages,
        id: messages[i]._id,
      });
    }
    res.json(listtosend);
  })
);

router.post(
  "/message",
  authorizeuser,
  asynchandler(async (req, res) => {
    await DirectMessage.findByIdAndUpdate(req.body.id, {
      $push: {
        messages: {
          message: req.body.message,
          user: req.user._id,
          id: req.body.messageid,
          username: req.user.username,
        },
      },
    });
    res.json({ username: req.user.username, id: req.user._id });
  })
);

router.delete(
  "/message",
  authorizeuser,
  asynchandler(async (req, res) => {
    const item = await DirectMessage.findOne({ id: req.body.messsageid });
    console.log(item);
  })
);

module.exports = router;
