const express = require("express");
const app = express();
const port = 3000;  
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const cors = require("cors");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "Public")));

let posts = [
    {
        id: uuidv4(),
        username: "Abdul Rahman",
        content: "I love Coding!"
    },
    {
        id: uuidv4(),
        username: "M Shoaib",
        content: "Hard work is important to achieve success!"
    },
    {
        id: uuidv4(),
        username: "M Salman",
        content: "I got selected for my first internship!"
    }
];

app.get("/posts", (req, res) => {
    res.render("index.ejs", { posts });
});

app.get("/posts/new", (req, res) => {
    res.render("new.ejs");
});

app.get("/posts/:id", (req, res) => {
    let { id } = req.params;
    let post = posts.find((p) => id === p.id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("show.ejs", { post });
});

app.get("/posts/:id/edit", (req, res) => {
    let { id } = req.params;
    let post = posts.find((p) => id === p.id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("edit.ejs", { post });
});

app.post("/posts", (req, res) => {
    let { username, content } = req.body;
    let id = uuidv4();
    posts.push({ id, username, content });
    res.redirect("/posts");
});

app.patch("/posts/:id", (req, res) => {
    let { id } = req.params;
    let newContent = req.body.content;
    let post = posts.find((p) => id === p.id);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    post.content = newContent;
    console.log("Updated post:", post);

    if (req.is("json")) {
        return res.json({ message: "Patch request was working! Post updated successfully.", post });
    }

    res.redirect("/posts");
});

app.delete("/posts/:id", (req, res) => {
    let { id } = req.params;
   
     posts = posts.filter((p) => id !== p.id);
     res.redirect("/posts");
})

app.listen(port, () => {
    console.log(`Port listening ... ${port}`);
});
