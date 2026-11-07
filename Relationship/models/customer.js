const mongoose = require("mongoose");
const { Schema } = mongoose;

main()
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/relationship");
}

const orderScheme = new Schema({
  item: String,
  price: Number,
});

const customerSchema = new Schema({
  name: String,
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "order",
    },
  ],
});
// customerSchema.pre("findOneAndDelete", async () => {
//   console.log("pre Middleware !");
// });
customerSchema.post("findOneAndDelete", async (customer) => {
  if (customer.orders.length) {
    let res = await order.deleteMany({ _id: { $in: customer.orders } });
    console.log(res);
  }
  console.log(customer);
});

const order = mongoose.model("order", orderScheme);
const customer = mongoose.model("customer", customerSchema);

// const addOrder = async () => {
//   let res = await order.insertMany([
//     { item: "soap", price: 112 },
//     { item: "excel", price: 90 },
//     { item: "laptop", price: 1000 },
//   ]);
//   console.log(res);
// };
// addOrder();

// const addCustomer = async () => {
//   let customer1 = new customer({ name: "Ali" });
//   let order1 = await order.findOne({ item: "soap" });
//   let order2 = await order.findOne({ item: "excel" });
//   customer1.orders.push(order1);
//   customer1.orders.push(order2);
//   let res = await customer1.save();
//   console.log(res);
// };
// addCustomer();

// ============================================
// STEP 3: Phir yeh chalao — customer find karne ke liye
// ============================================
// const findCustomer = async () => {
//   let result = await customer.find({}).populate("orders");
//   console.log(result[0]);
// };
// findCustomer();

const addCustomer = async () => {
  let customer1 = new customer({
    name: "Ali",
  });
  let order1 = new order({
    item: "mobile",
    price: 120,
  });
  customer1.orders.push(order1);
  await customer1.save();
  await order1.save();

  console.log("Added new customers ");
};

// addCustomer();

const delCus = async () => {
  let del = await customer.findByIdAndDelete({
    _id: "6ad990eca920e49162708ddb",
  });
  console.log(del);
};
delCus();
