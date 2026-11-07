const mongoose = require("mongoose");
const { Schema } = mongoose;

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationship");
}

const userSchema = new Schema({
  username: String,
  addresses: [
    {
      location: String,
      city: String,
    },
  ],
});

const user = mongoose.model("user", userSchema);

const addUser = async () => {
  let user1 = new user({
    username: "AbdulRahman",
    addresses: [
      {
        _id: false,
        location: "multan pakistan",
        city: "multan",
      },
    ],
  });
  user1.addresses.push({ location: "india", city: "pakistan" });
  let result = await user1.save();
  console.log(result);
};

addUser();
