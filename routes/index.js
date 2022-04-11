const express = require("express")
const router = express.Router()
const { ensureAuthenticated } = require("../config/auth.js")
const {
  getAllPlays,
  getOnePlay,
  getMultiplePlaysFromInstances,
} = require("../controllers/plays-controller.js")
const { getReviewsOfPlayAndUsers, getAllReviews } = require("../controllers/reviews-controller.js")
const {
  getUserWishlistAndReviews,
  getUserAndWishlist
} = require("../controllers/users-controller.js")
const { Play }  = require("../models/play")
const { PlayInstance } = require("../models/playInstance")

//home page
router.get("/", async (req, res) => {
  let allPlays = await getAllPlays()
  const user = req.user ? await getUserAndWishlist(req.user) : undefined
  const reviews = await getAllReviews()

  res.render("index", {
    title: "Home",
    user,
    allplays: allPlays,
    reviews
  })
})

// signup page
router.get("/signup", (req, res) => {
  res.render("signup", {
    layout: "layouts/no-footer",
    title: "Sign up",
    user: req.user,
  })
})

// Search for a play
router.post("/", async (req, res) => {
  // console.log(req.body.searchinput)
  const user = req.user
    ? await getUserAndWishlist(req.user)
    : undefined
  const reviews = await getAllReviews()

  let searchinput = req.body.searchinput
  let allplayinstances

  if (searchinput != "") {
    const allplays = await Play.find({
      $or: [
        { title: { $regex: String(searchinput) } },
        { production: { $regex: String(searchinput) } },
      ],
    }).populate("playsInstances")

    const allplayInstances = await PlayInstance.find({
      summary: { $regex: String(searchinput) },
    })

    const totalPlays = await getMultiplePlaysFromInstances(allplayInstances)

    let fullPlays = allplays.concat(totalPlays)
    const uniquePlays = Array.from(new Set(fullPlays.map((a) => a.id))).map(
      (id) => {
        return fullPlays.find((a) => a.id === id)
      }
    )

    res.render("index", {
      title: "Home",
      user,
      allplays: uniquePlays,
      allplayInstances: allplayinstances,
      reviews
    })
  } else {
    let allPlays = await getAllPlays()
    res.render("index", {
      title: "Home",
      user,
      allplays: allPlays,
      allplayInstances: allplayinstances,
      reviews
    })
  }
})

// play page
router.get("/play/:PlayId/:playInstanceId", async (req, res) => {
  const playId = req.params.PlayId
  const playInstanceId = req.params.playInstanceId

  let onePlay = await getOnePlay(playId, playInstanceId)
  const user = req.user ? await getUserWishlistAndReviews(req.user) : undefined
  const reviews = await getReviewsOfPlayAndUsers(playId)

  res.render("play", {
    title: "Plays",
    user,
    play: onePlay,
    reviews
  })
})

//signup confirmation page
router.get("/signupconfirm", (req,res) => {
  res.render("signupconfirm", {
    title: "Sign up Confirmation",
    layout: "layouts/no-footer", 
    user: req.user, 
  })
})

//forgot password page
router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword", {
    title: "Forgot Password",
    layout: "layouts/no-footer",
    user: req.user,
  })
})

module.exports = router