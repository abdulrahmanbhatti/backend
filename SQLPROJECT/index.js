const express = require("express");
const { faker } = require("@faker-js/faker");
const app = express();
const path = require("path");
const mysql = require("mysql2");
const { log } = require("console");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
const port = 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.listen(port, () => {
  console.log(`server is running at the port ${port}`);
});
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "delta_app",
});
const randomDAta = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
// let data = [];
// for( let i=1 ; i<=100; i++){
// data.push(randomDAta())
// }

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// connection.query(q, [data], (err, result) => {
//   if (err) {
//     console.error("Database error:", err.message);
//     return;
//   }
//   console.log("User inserted successfully:", result);
// });
// connection.end();

app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM user";
  connection.query(q, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);

      return;
    }
    let count = result[0]["count(*)"];
    res.render("home.ejs", { count });
    console.log("User inserted successfully:", result[0]["count(*)"]);
  });
});

app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  connection.query(q, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return;
    }
    let users = result;
    res.render("show.ejs", { users });
  });
});

app.patch("/user/:id", (req, res) => {
  const { id } = req.params;
  const { password: formPass, username: newUser } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  connection.query(q, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error");
    }
    let user = result[0];
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (formPass != user.password) {
      res.send("wrong password !");
    } else {
      let q2 = `UPDATE user SET username = '${newUser}' WHERE id = '${id}'`;
      connection.query(q2, (err, result) => {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).send("Database error");
        }
        res.redirect("/user");
      });
    }
  });
});

app.get("/user/:id/edit", (req, res) => {
  const { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return;
    }
    let user = result[0];
    console.log(user);

    res.render("edit.ejs", { user });
  });
});

app.get("/user/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/user/add", (req, res) => {
  const { username, email, password } = req.body;
  const id = faker.string.uuid();
  let q =
    "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
  let data = [id, username, email, password];

  connection.query(q, data, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error: " + err.message);
    }
    console.log("User inserted successfully:", result);
    res.redirect("/user");
  });
});

app.get("/user/:id/delete", (req, res) => {
  const { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error");
    }
    let user = result[0];
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("delete.ejs", { user });
  });
});

app.delete("/user/:id", (req, res) => {
  const { id } = req.params;
  const { password: formPass, username: newUser } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;

  connection.query(q, (err, result) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Database error");
    }
    let user = result[0];
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (formPass !== user.password || newUser !== user.username) {
      return res.send("wrong username or password !");
    } else {
      let q2 = `DELETE FROM user WHERE id = '${id}'`;
      connection.query(q2, (err, result) => {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).send("Database error");
        }
        res.redirect("/user");
      });
    }
  });
});
