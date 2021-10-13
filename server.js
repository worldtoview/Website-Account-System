const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const got = require('got');
const env = require("dotenv");

const ObjectId = mongoose.Types.ObjectId;
env.config();

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "./pages");

app.use(
  session({
    secret: process.env.SESSION_SECRET, // just spam ur keyboard in the .env file
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      autoRemove: "native",
    }),
    name: "MyWebsite", // change if u want
    saveUninitialized: false,
    rolling: true,
    resave: true,
    cookie: {
      domain: process.env.DOMAIN,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Account = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const AccModel = new mongoose.model("Account", Account);

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/api/signup", async (req, res) => {
  var result = { success: false };

  try {
    //Verify the captcha data
    const captchaVerified = await got.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${req.body.captcha}`
      , {responseType: 'json'})

    if(captchaVerified.body.success === true) {
      // Capthca is correct, continue the code

    try {

    //Search if username is taken
    var foundDoc = await new Promise((resolve, reject) => {
      AccModel.findOne({ username: req.body.username }, function (err, doc) {
        if (err) reject(err);
        resolve(doc);
      });
    });
    if (foundDoc) throw "Error: Account already exists with this username!";

    if (!req.body.username) throw "Missing username";
    if (!req.body.password) throw "Missing password";
    if (!req.body.email) throw "Missing email";

    //Make password safe
    var hashedPass = await bcrypt.hash(req.body.password, 10);

    //Prepare data to save
    var accDoc = new AccModel();
    accDoc.username = req.body.username;
    accDoc.password = hashedPass;
    accDoc.email = req.body.email;

    //Save to database
    await new Promise((resolve, reject) => {
      accDoc.save(function (e) {
        if (e) reject(e);
        resolve();
      });
    });
    
    result.success = true;
    }
    catch(e){
      if (typeof e === "string") result.reason = e;
      else {
        result.reason = "Server error";
        console.log(e);
      }
    }
    }
  } catch (e) {
    if (typeof e === "string") result.reason = e;
    else {
      result.reason = "Server error";
      console.log(e);
    }
  }

  res.json(result);
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/api/login", async (req, res) => {
  var result = { response: false };

  try {
    if (req.session.uid) throw "You are already logged in!";

    var username = req.body.username;
    if (!username) throw "Missing username!";

    var password = req.body.password;
    if (!password) throw "Missing password!";

    var accData = await new Promise((resolve, reject) => {
      AccModel.findOne({ username: username }, function (err, doc) {
        if (err) reject(err);
        resolve(doc);
      });
    });

    if (!accData) throw "No account exists with that username!";
    console.log(accData);

    var accPass = accData.password;

    var passwordMached = await bcrypt.compare(password, accPass);
    if (!passwordMached) throw "Incorrect password!";

    req.session.uid = accData._id;

    result.success = true;
  } catch (e) {
    if (typeof e === "string") result.reason = e;
    else {
      result.reason = "Server error";
      console.log(e);
    }
  }

  res.json(result);
});

app.get("/logout", (req, res) => {
  if (req.session.uid) req.session.destroy();
  res.redirect("/login");
});

app.get("/profile", async (req, res) => {
  if (!req.session.uid) return res.redirect("/login");

  var id = new ObjectId(req.session.uid);

  var accData = await new Promise((resolve, reject) => {
    AccModel.findOne({ _id: id }, function (err, doc) {
      if (err) reject(err);
      resolve(doc);
    });
  });

  var username = accData.username;
  var email = accData.email;

  res.render("profile.ejs", { username: username, email: email });
});

app.listen(port, () => console.log(`App listening on port ${port}`));
