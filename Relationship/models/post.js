const mongoose = require("mongoose");
const strict = require("node:assert/strict");
const { Schema } = mongoose;

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationship");
}

const userScheme = new Schema({
  name: String,
  email: String,
});

const postSchema = new Schema({
  content: String,
  like: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});
const user = mongoose.model("user", userScheme);
const post = mongoose.model("post", postSchema);

// const addData = async () => {
//   let users = await user.findOne({ name: "shoaib" });

//   let post2 = new post({
//     content: "this is a simple post ",
//     like: 123,
//   });
//   post2.user = users;

//   //   await user1.save();
//   await post2.save();
// };

// addData();

const getData = async () => {
  let posts = await post.find({}).populate("user");
  console.log(posts);
};
getData();
