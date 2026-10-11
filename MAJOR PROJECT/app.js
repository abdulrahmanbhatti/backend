const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAcync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExperessError.js");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust");
}

app.get("/", (req, res) => {
  res.send("Hi ! i am a root ");
});

// app.get("/test", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "MY Home",
//     description: "this is my home",
//     price: 1200,
//     location: "Multan",
//     country: "Pakistan",
//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });
app.get(
  "/listings",
  wrapAcync(async (req, res) => {
    let listingData = await Listing.find({});
    res.render("listing/index.ejs", {
      listingData,
    });
  }),
);

app.get(
  "/listing",
  wrapAcync(async (req, res) => {
    let listingData = await Listing.find({});
    res.render("listing/index.ejs", { listingData });
  }),
);

app.get("/listings/new", (req, res) => {
  res.render("listing/new.ejs");
});

app.post(
  "/listings",
  wrapAcync(async (req, res, next) => {
    //   let {title ,description ,image,price,location,country} = req.body;
    //   let listing = new Listing({
    //     title:title,
    //     description:description,
    //     image:image,
    //     price:price,
    //     location:location,
    //     country:country,
    //   })
    //  await listing.save()
    //   res.redirect("listings")

    const newListing = new Listing(req.body.listing || req.body.Listing);
    if (!req.body.listing) {
      throw new ExpressError(400, "send valid data for listing ");
    }
    await newListing.save();
    res.redirect("/listings");
  }),
);

app.get(
  "/listings/:id",
  wrapAcync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/show.ejs", { listing });
  }),
);

// app.get("/listing/:id/edit", async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);

//   res.render("listing/edit.ejs", { listing });
// });
app.get(
  "/listings/:id/edit",
  wrapAcync(async (req, res) => {
    let { id } = req.params;
    if (id && id.startsWith(":")) id = id.slice(1);
    const listing = await Listing.findById(id);
    res.render("listing/edit.ejs", { listing });
  }),
);

app.get(
  "/listing/:id/edit",
  wrapAcync(async (req, res) => {
    let { id } = req.params;
    if (id && id.startsWith(":")) id = id.slice(1);
    const listing = await Listing.findById(id);
    res.render("listing/edit.ejs", { listing });
  }),
);

app.put(
  "/listings/:id",
  wrapAcync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "send valid data for listing ");
    }
    let { id } = req.params;
    if (id && id.startsWith(":")) id = id.slice(1);
    let updatedListing = { ...req.body.listing };
    if (typeof updatedListing.image === "string") {
      updatedListing.image = {
        filename: "listingimage",
        url: updatedListing.image,
      };
    }
    await Listing.findByIdAndUpdate(id, updatedListing);
    res.redirect(`/listings/${id}`);
  }),
);

app.delete(
  "/listings/:id",
  wrapAcync(async (req, res) => {
    let { id } = req.params;
    if (id && id.startsWith(":")) id = id.slice(1);
    const deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);

    res.redirect("/listings");
  }),
);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("server is listening! ");
});
