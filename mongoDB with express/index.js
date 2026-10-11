const express = require("express");
const mongoose = require("mongoose");
const Chat = require("./models/chat.js");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError.js");
const { dir } = require("console");
const app = express();
const port = 3000;
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fakeWhatsapp");
}

function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
}

app.get(
  "/chats",
  asyncWrap(async (req, res) => {
    let chats = await Chat.find();
    console.log(chats);
    res.render("index.ejs", { chats });
  }),
);

app.get("/chats/new", (req, res, next) => {
  // throw new ExpressError(404, "this is a custom error ");
  res.render("new.ejs");
});

app.post(
  "/chats",
  asyncWrap(async (req, res, next) => {
    let { from, message, to } = req.body;
    let newChat = new Chat({
      from: from,
      message: message,
      to: to,
      created_at: new Date(),
      create_at: new Date(),
    });
    await newChat.save();
    res.redirect("/chats");
  }),
);

app.get("/", (req, res) => {
  res.send("root is working");
});

app.get(
  "/chats/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
      return next(new ExpressError(404, "chat is not found ! "));
    }
    res.render("edit.ejs", { chat });
  }),
);

app.get(
  "/chats/:id/edit",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs", { chat });
  }),
);

app.put(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let { message, newMessage } = req.body;

    let update = await Chat.findByIdAndUpdate(
      id,
      { message: message || newMessage },
      { runValidators: true, new: true },
    );
    res.redirect("/chats");
  }),
);

app.delete(
  "/chats/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log("Deleted chat:", deletedChat);
    res.redirect("/chats");
  }),
);
const heandelValidation = (err) => {
  console.log("this was a validation error please follow role ");
  console.dir(err.message);
  return err;
};

app.use((err, req, res, next) => {
  console.log(err.name);
  if (err.name === "ValidationError") {
    err = heandelValidation(err);
  }
  next(err);
});

app.use((err, req, res, next) => {
  let { status = 500, message = "this is Error  !  " } = err;
  res.status(status).send(message);
});

app.listen(port, () => {
  console.log("server is listening ");
});
