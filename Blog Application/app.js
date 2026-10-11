const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data", "blogs.json");

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Helper Functions (File Storage) ---
function getBlogs() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]", "utf-8");
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(rawData || "[]");
  } catch (error) {
    console.error("Error reading blogs.json:", error);
    return [];
  }
}

function saveBlogs(blogs) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to blogs.json:", error);
  }
}

// --- Routes ---

// Home - All Blogs
app.get("/blogs", (req, res) => {
  const blogs = getBlogs();
  res.render("index.ejs", { blogs });
});

// Root redirect
app.get("/", (req, res) => {
  res.redirect("/blogs");
});

// New Blog Form
app.get("/blogs/new", (req, res) => {
  res.render("new.ejs");
});

// Create Blog (POST)
app.post("/blogs", (req, res) => {
  const { title, author, category, content } = req.body;
  const blogs = getBlogs();

  const newBlog = {
    id: uuidv4(),
    title,
    author: author || "Anonymous",
    category: category || "General",
    content,
    createdAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  };

  blogs.unshift(newBlog); // Naya post sabse upar
  saveBlogs(blogs);

  res.redirect("/blogs");
});

// Show Single Blog
app.get("/blogs/:id", (req, res) => {
  const { id } = req.params;
  const blogs = getBlogs();
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  res.render("show.ejs", { blog });
});

// Edit Blog Form
app.get("/blogs/:id/edit", (req, res) => {
  const { id } = req.params;
  const blogs = getBlogs();
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  res.render("edit.ejs", { blog });
});

// Update Blog (PATCH)
app.patch("/blogs/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, category, content } = req.body;
  const blogs = getBlogs();
  const blog = blogs.find((b) => b.id === id);

  if (!blog) {
    return res.status(404).send("Blog not found");
  }

  blog.title = title;
  blog.author = author;
  blog.category = category;
  blog.content = content;

  saveBlogs(blogs);
  res.redirect(`/blogs/${id}`);
});

// Delete Blog (DELETE)
app.delete("/blogs/:id", (req, res) => {
  const { id } = req.params;
  let blogs = getBlogs();
  blogs = blogs.filter((b) => b.id !== id);

  saveBlogs(blogs);
  res.redirect("/blogs");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/blogs`);
});