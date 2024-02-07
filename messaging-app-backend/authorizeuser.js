const jwt = require("jsonwebtoken");
const { model } = require("mongoose");

function authorizeuser(req, res, next) {
  const token = req.cookies.usertoken;
  console.log(token);
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("usertoken");
    res.json("not authorized");
  }
}

module.exports = authorizeuser;
