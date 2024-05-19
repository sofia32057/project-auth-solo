import cors from "cors";
import express from "express";
import mongoose, { model } from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-auth";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// user model
const User = model("User", {
  accessToken: {
    type: String,
    default: () => bcrypt.genSaltSync(),
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  plusOne: {
    type: String,
  },
  foodSelection: {
    type: String,
  },
});

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// Get all users
app.route("/users").get(async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Post new user
app.route("/users/registration").post(async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);
  try {
    const newUser = await new User({
      name: req.body.name,
      password: hash,
    }).save();
    res.status(201).send(newUser);
  } catch (err) {
    res.status(400).json({ message: "Post request failed", error: err });
  }
});

// Login to application
app.route("/login").post(async (req, res) => {
  // Find user by name
  const user = await User.findOne({ name: req.body.name }).exec();

  // Check if password is correct
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    // a. User name and password match
    res.status(201).json({ message: "It worked!!" });
  } else if (user) {
    // b. user exists but password did not match
    res.status(401).json({ message: "Password did not match" });
  } else {
    // c. user does not exists
    res.status(400).json({ message: "user name invalid" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
