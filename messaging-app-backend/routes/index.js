var express = require("express");
var router = express.Router();
const asynchandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require("../database-models/users");
const Server = require("../database-models/servers");
const DirectMessage = require("../database-models/message");
const jwt = require("jsonwebtoken");
const authorizeuser = require("../authorizeuser");
const message = require("../database-models/message");
const crypto = require("crypto");

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
    res.json({ username: req.user.username, id: req.body.messageid });
  })
);

router.delete(
  "/message",
  authorizeuser,
  asynchandler(async (req, res) => {
    let messagetodelete = {};
    const item = await DirectMessage.findOne({ _id: req.body.threadid });
    for (i = 0; i < item.messages.length; i++) {
      if (item.messages[i].id == req.body.messageid) {
        item.messages.splice(i, 1);
        await item.save();
      }
    }
    res.json(req.body.messageid);
  })
);

router.get(
  "/users",
  authorizeuser,
  asynchandler(async (req, res) => {
    let messagetosend = [];
    const users = await User.find();
    users.forEach((user) => {
      messagetosend.push({
        username: user.username,
        id: user._id,
      });
    });
    res.json(messagetosend);
  })
);
router.post(
  "/firstmessage",
  authorizeuser,
  asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const otheruser = await User.findById(req.body.otheruser);
    let alreadychat = await DirectMessage.findOne({
      users: { $all: [req.body.otheruser, req.user._id] },
    });
    if (req.body.otheruser == req.user._id) {
      alreadychat = await DirectMessage.findOne({
        users: [req.user._id, req.user._id],
      });
      if (!user.messages.includes(alreadychat._id)) {
        user.messages.push(alreadychat._id);
        await user.save();
      }
    }
    if (alreadychat != null) {
      const a = crypto.randomUUID();
      alreadychat.messages.push({
        message: req.body.message,
        user: req.user._id,
        id: a,
        username: req.user.username,
      });
      if (!user.messages.includes(alreadychat._id)) {
        user.messages.push(alreadychat._id);
        await user.save();
      }
      if (!otheruser.messages.includes(alreadychat._id)) {
        otheruser.messages.push(alreadychat._id);
        await otheruser.save();
      }
      await alreadychat.save();
    } else {
      const a = crypto.randomUUID();
      const newchat = new DirectMessage({
        users: [req.user._id, req.body.otheruser],
        messages: [
          {
            message: req.body.message,
            user: req.user._id,
            id: a,
            username: req.user.username,
          },
        ],
      });
      await newchat.save();
      const chatid = await DirectMessage.findOne({
        users: [req.user._id, req.body.otheruser],
      });
      user.messages.push(chatid._id);
      otheruser.messages.push(chatid._id);
      await user.save();
      await otheruser.save();
    }

    res.json(200);
  })
);

router.delete(
  "/closedm",
  authorizeuser,
  asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    user.messages.forEach((message, index) => {
      if (message == req.body.messageid) {
        user.messages.splice(index, 1);
      }
    });
    await user.save();
    res.json(200);
  })
);

router.get(
  "/channels:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.serverid);
    res.json({
      channels: server.channels,
      voice_channels: server.voice_channels,
    });
  })
);

router.get(
  "/user",
  authorizeuser,
  asynchandler(async (req, res) => {
    res.json(req.user);
  })
);

router.delete(
  "/channelmessage:id",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findOne({ _id: req.params.id });
    for (let i = 0; i < server.channels.length; i++) {
      if (server.channels[i].id == req.body.channel) {
        for (let o = 0; o < server.channels[i].messages.length; o++) {
          if (server.channels[i].messages[o].id == req.body.messageid) {
            server.channels[i].messages.splice(o, 1);
            await Server.findByIdAndUpdate(req.params.id, {
              channels: server.channels,
            });
          }
        }
      }
    }
    res.json(req.body.messageid);
  })
);

router.post(
  "/channelmessage:id",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findOne({ _id: req.params.id });
    for (let i = 0; i < server.channels.length; i++) {
      if (server.channels[i].id == req.body.channel_id) {
        server.channels[i].messages.push({
          message: req.body.message,
          user: req.user.username,
          id: req.body.messageid,
        });
        await Server.findByIdAndUpdate(req.params.id, {
          channels: server.channels,
        });
      }
    }
    res.json(req.body.messageid);
  })
);
router.post(
  "/addchannel:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    if (req.body.channeltype === "text") {
      const a = await Server.findByIdAndUpdate(req.params.serverid, {
        $push: {
          channels: {
            name: req.body.channelname,
            messages: [],
            id: req.body.channel_id,
          },
        },
      });
    } else {
      const a = await Server.findByIdAndUpdate(req.params.serverid, {
        $push: {
          voice_channels: {
            name: req.body.channelname,
            id: req.body.channel_id,
          },
        },
      });
    }

    res.json(200);
  })
);
router.get(
  "/isowner:id",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.id);
    if (req.user._id == server.owner) {
      res.json({ value: "true" });
    } else {
      res.json({ value: "false" });
    }
  })
);

router.delete(
  "/channel:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.serverid);
    for (let i = 0; i < server.channels.length; i++) {
      if (server.channels[i].id == req.body.channel_id) {
        server.channels.splice(i, 1);
        await server.save();
      }
    }
    for (let i = 0; i < server.voice_channels.length; i++) {
      if (server.voice_channels[i].id == req.body.channel_id) {
        server.voice_channels.splice(i, 1);
        await server.save();
      }
    }
    res.json(200);
  })
);

router.put(
  "/channel:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.serverid);
    for (let i = 0; i < server.channels.length; i++) {
      if (server.channels[i].id == req.body.channel_id) {
        const newchannel = server.channels[i];
        newchannel.name = req.body.name;
        server.channels.splice(i, 1, newchannel);
        await server.save();
      }
    }
    for (let i = 0; i < server.voice_channels.length; i++) {
      if (server.voice_channels[i].id == req.body.channel_id) {
        const newchannel = server.voice_channels[i];
        newchannel.name = req.body.name;
        server.voice_channels.splice(i, 1, newchannel);
        await server.save();
      }
    }
    res.json(200);
  })
);

router.post(
  "/server",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = new Server({
      name: req.body.servername,
      users: [req.user._id],
      owner: req.user._id,
    });
    await server.save();
    const user = await User.findById(req.user._id);
    user.servers.push(server._id);
    await user.save();
    res.json(200);
  })
);

router.put(
  "/server:id",
  authorizeuser,
  asynchandler(async (req, res) => {
    await Server.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.json(200);
  })
);

router.delete(
  "/server:id",
  authorizeuser,
  asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    await Server.findByIdAndDelete(req.params.id);
    for (let i = 0; i < user.servers.length; i++) {
      if (user.servers[i] == req.params.id) {
        user.servers.splice(i, 1);
        await user.save();
      }
    }
    res.json(200);
  })
);

router.post(
  "/joinserver",
  authorizeuser,
  asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const server = await Server.findById(req.body.serverid);
    if (!user.servers.includes(req.body.serverid)) {
      user.servers.push(req.body.serverid);
      server.users.push(req.user._id);
      await user.save();
      await server.save();
    }

    res.json(200);
  })
);

router.get(
  "/logout",
  authorizeuser,
  asynchandler(async (req, res) => {
    res.clearCookie("usertoken");
    res.json(200);
  })
);

router.get(
  "/members:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.serverid);
    let userlist = [];
    let useridlist = [];
    server.users.forEach((userid) => {
        useridlist.push(userid);
    });
    for (let i = 0; i < useridlist.length; i++) {
      const user = await User.findById(useridlist[i]);
      userlist.push({
        username: user.username,
        id: user._id,
      });
    }
    res.json(userlist);
  })
);

router.delete(
  "/members:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.serverid);
    const user = await User.findById(req.body.userid);
    for (let i = 0; i < server.users.length; i++) {
      if (server.users[i] == req.body.userid) {
        server.users.splice(i, 1);
        await server.save();
      }
    }
    for (let i = 0; i < user.servers.length; i++) {
      if (user.servers[i] == req.params.serverid) {
        user.servers.splice(i, 1);
        await user.save();
      }
    }
    res.json(200);
  })
);

router.delete(
  "/leave:serverid",
  authorizeuser,
  asynchandler(async (req, res) => {
    const server = await Server.findById(req.params.serverid);
    const user = await User.findById(req.user._id);
    for (let i = 0; i < server.users.length; i++) {
      if (server.users[i] == req.user._id) {
        server.users.splice(i, 1);
        await server.save();
      }
    }
    for (let i = 0; i < user.servers.length; i++) {
      if (user.servers[i] == req.params.serverid) {
        user.servers.splice(i, 1);
        await user.save();
      }
    }
    res.json(200);
  })
);

module.exports = router;
