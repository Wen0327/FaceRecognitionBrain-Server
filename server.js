const express = require("express");
// Express >= 4.16.0
// body parser has been re-added under the methods
// express.json() and express.urlencoded()
// const bcrypt = require('bcrypt-nodejs');
const cors = require("cors");

const app = express();

// remember to parse the data
app.use(express.json());
app.use(cors());

const db = {
  users: [
    {
      id: "1",
      name: "Anne",
      email: "Anne@gmail.com",
      password: "Anne0101",
      entries: 0,
      joined: new Date(),
    },
  ],
};

//postman
app.get("/", (req, res) => {
  res.send(db.users);
});

//SignIn
app.post("/SignIn", (req, res) => {
  //Check whether the pw match
  if (
    req.body.email === db.users[0].email &&
    req.body.password === db.users[0].password
  ) {
    res.json(db.users[0]);
  } else {
    res.status(400).json("error in Logging In");
  }
});

//Register, the users can not be the same
app.post("/Register", (req, res) => {
  const { email, name } = req.body;

  db.users.push({
    id: "2",
    name: name,
    email: email,
    // password: password,
    entries: 0,
    joined: new Date(),
  });
  res.json(db.users[db.users.length - 1]);
});

//get user by loop the db and find out the match id
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  db.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(400).json("Not found!");
  }
});

//put img
app.put("/image", (req, res) => {
  const { id } = req.body;
  let found = false;
  db.users.forEach((user) => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json("Not found!");
  }
});

// // hash pw
// bcrypt.hash("bacon", null, null, function(err, hash) {
//   // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//   // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//   // res = false
// });

//listen to the port 3001
app.listen(3001, () => {
  console.log("app is running on port 3001");
});
