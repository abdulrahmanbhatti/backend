const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/fakeWhatsapp");
}

let allChats = [
  {
    from: "Abdul",
    to: "Rahman",
    message: "Please send me the final exam date sheet.",
    created_at: new Date(),
  },
  {
    from: "Rahman",
    to: "Abdul",
    message: "Check your email, I just sent the PDF.",
    created_at: new Date(),
  },
  {
    from: "Bhatti",
    to: "Rizwan",
    message: "Did Sir share the room numbers for test?",
    created_at: new Date(),
  },
  {
    from: "Shakeel",
    to: "Salman",
    message: "Send me your DBMS handwritten notes please.",
    created_at: new Date(),
  },
  {
    from: "Ali",
    to: "Ahsan",
    message: "Are we meeting at the library before paper?",
    created_at: new Date(),
  },
];

Chat.insertMany(allChats)
  .then((res) => {
    console.log("Data inserted successfully:");
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
