const mongoose = require("mongoose");
main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/amazon");
}

const booksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 20,
  },
  author: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [1, "price is not valid"],
  },
  discount: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ["fiction", "non-fiction"],
  },
});

const book = mongoose.model("book", booksSchema);

book
  .findByIdAndUpdate(
    "6aaeaadc5dea017f38e9b894",
    { price: -300 },
    { runValidators: true },
  )
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err.errors.price.properties.message);
  });

// let book1 = new book({
//   title: "java",
//   author: "ahsan ",
//   price: 200,
//   category:"fiction"
// });

// book1
//   .save()
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
