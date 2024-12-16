// console.log("inside routes");

const express = require("express");
const router = express.Router();

// const campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
// const campgroundSchema = require("../validationSchema");
const reviewSchema = require("../reviewSchema");
const Review = require("../models/review");
const {isLoggedIn,validateCampground,isAuthor} = require("../middleware");
const campground = require("../controller/campground");
const multer = require("multer");
const {storage} = require("../cloudinary");
const upload = multer({storage});

router.route("/")
    .get(catchAsync(campground.index))
    .post(isLoggedIn, upload.array("image"),validateCampground, catchAsync(campground.createCampground))

router.get("/evaluate" , catchAsync(campground.evaluate));

router.get("/fronts/:id" , catchAsync(campground.fronts));

router.get("/depot" , catchAsync(campground.depot));

router.get("/new",isLoggedIn,campground.renderNewFrom)

router.route("/:id")
    .get(catchAsync(campground.renderEditFrom))
    .put(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campground.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campground.deleteCampground))


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campground.renderEditFrom))

router.route("/:id/addRoom")
    .get(isLoggedIn, isAuthor, catchAsync(campground.addRoom))
    .post(isLoggedIn, isLoggedIn, isAuthor, catchAsync(campground.roomAdd))

router.get("/:id/preview" , isLoggedIn , isAuthor , catchAsync(campground.preview))

router.get("/:id/book",isLoggedIn,catchAsync(campground.bookPage));

router.route("/:id/roomBook")
    .get(isLoggedIn,catchAsync(campground.roomBook))
    .post(isLoggedIn,catchAsync(campground.confirmBooking))

router.get("/:id/preview",isLoggedIn,isAuthor,catchAsync(campground.preview));

module.exports = router;