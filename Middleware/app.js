const express = require("express");
const app = express();
const ExpressError = require("./expressError.js");

// app.use((req, res, next) => {
//   console.log("this is a first  middleware !");
//   next();
// });

// app.use((req, res, next) => {
//   console.log("this is a 2nd middleware !");
//   next();
// });

// app.use((req, res, next) => {
//   req.time = new Date(Date.now()).toString();
//   console.log(req.method, req.hostname, req.time);
//   next();
// });

const chacktoken = (req, res, next) => {
  let { token } = req.query;
  if (token === "giveaccess") {
    return next();
  }
  throw new ExpressError(401, "ACCESS DENIED ");
};

app.get("/api", chacktoken, (req, res) => {
  res.send("data");
});

app.get("/error", (req, res) => {
  abs = abs;
});

app.get("/", (req, res) => {
  res.send("This is  a root  ! ");
});

app.get("/random", (req, res) => {
  res.send("this is random ");
});
app.get("/admin", (req, res) => {
  throw new ExpressError(404, "this root for admin !");
});
// Custom Error Handling Middleware (Sabhi routes ke baad hona chahiye)
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong" } = err;
  console.log("--------- ERROR ---------");
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log("server listening at the port 3000");
});
