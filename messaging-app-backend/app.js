var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("../messaging-app-backend/database-models/message");
mongoose.connect(process.env.MONGO_DB_URL);

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

async function mockmessages() {
  const dm1 = new Message({
    users: ["65b4e8939b6387fade2294b3", "65b4e8a19b6387fade2294b6"],
    messages: [
      { message: "hey", user: "65b4e8939b6387fade2294b3" },
      { message: "whaddup", user: "65b4e8a19b6387fade2294b6" },
      { message: "whaddup", user: "65b4e8939b6387fade2294b3" },
    ],
  });

  const dm2 = new Message({
    users: ["65b4e8939b6387fade2294b3", "65b503ef672eaa4771905b7e"],
    messages: [
      { message: "hey", user: "65b4e8939b6387fade2294b3" },
      { message: "whaddup", user: "65b503ef672eaa4771905b7e" },
      { message: "whaddup", user: "65b4e8939b6387fade2294b3" },
    ],
  });

  const dm3 = new Message({
    users: ["65b4e8a19b6387fade2294b6", "65b503ef672eaa4771905b7e"],
    messages: [
      { message: "hey", user: "65b4e8a19b6387fade2294b6" },
      { message: "whaddup", user: "65b503ef672eaa4771905b7e" },
      { message: "whaddup", user: "65b4e8a19b6387fade2294b6" },
    ],
  });
  await dm1.save();
  await dm2.save();
  await dm3.save();
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
