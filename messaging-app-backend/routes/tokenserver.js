var express = require("express");
var router = express.Router();
const asynchandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const authorizeuser = require("../authorizeuser");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const APP_ID = process.env.AGORA_ID;
const APP_CERTIFICATE = process.env.AGORA_CERTIFICATE;

function nocache(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
}

function generateAccessToken(req, res) {
  const channelName = req.params.channel;
  if (!channelName) {
    return res.status(500).json({ error: "channel is required" });
  }

  let uid = 0;
  let role = RtcRole.SUBSCRIBER;
  let expiretime = 3600;

  const currentTime = Math.floor(Date.now() / 1000);
  const privelegeExpireTime = currentTime + expiretime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privelegeExpireTime
  );

  res.json({
    token: token,
    APP_ID: APP_ID,
    APP_CERTIFICATE: APP_CERTIFICATE,
    channelName: channelName,
  });
}

router.get("/video_token:channel", nocache, generateAccessToken);

module.exports = router;
