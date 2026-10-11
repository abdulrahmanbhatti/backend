const mongoose = require("mongoose");

main()
  .then(() => {
    console.log("connection successful");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
}

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);
// Pass ID directly as a string (not {_id: '...'}).
// Note: findByIdAndDelete returns null if the document with this ID is already deleted or does not exist.
User.findByIdAndDelete("6aae154313d7542385964d88")
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });

// User.deleteOne({name:"Abdul"}).then(res=>{console.log(res);
// }).catch(err=>{console.log(err);
// })

// User.updateOne({name:"Abdul"}, {age:20}).then(res=>{console.log(res);
// })

// User.findOneAndUpdate({name:"Abdul"},{age:50},{new:true}).then(res=>{console.log(res);
// })

// const Employee = mongoose.model("Employee",userSchema);

// User.find({age:{$gt:40}}).then(res=>{console.log(res);
// }).catch(err=>{console.log(err);
// })
// User.findById({_id:'6aae154313d7542385964d89'}).then(res=>{console.log(res);
// }).catch(err=>{console.log(err);
// })

// User.insertMany([
//     {name:"muhammad",email:"muhammad2gmail.com",age:45},
//     {name:"shoaib",email:"shoaib2gmail.com",age:40},
//     {name:"bhatti",email:"bahtigmail.com",age:25},
// ]).then((res)=>{console.log(res);
// })

// const user2= new User({
//     name:'Rahman',
//     email:"Rahman@gmail.com",
//     age:43

// })

// user2.save().then((res)=>{console.log(res);
// }).catch((err)=>{console.log(err);
// })
