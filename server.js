const express = require("express");
// Express >= 4.16.0
// body parser has been re-added under the methods
// express.json() and express.urlencoded()
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const handleRegister = require('./controllers/register');
const register = require("./controllers/register");
const signIn = require('./controllers/signIn')

const database = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: "chenwenyu",
    password: "",
    database: "smart-brain",
  },
});

// database.select('*').from('users').then(data =>{
//   console.log(data);
// })

const app = express();

// remember to parse the data
app.use(express.json());
app.use(cors());



// postman
app.get("/", (req, res) => {
  res.send(database.users);
});

//SignIn
app.post("/SignIn",(req, res)=>{signIn.handleSignIn(req, res, database, bcrypt)});

//Register, the users can not be the same
app.post("/Register",(req, res)=>{register.handleRegister(req, res, database, bcrypt)});

//get user by loop the db and find out the match id
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  database
    .select("*")
    .from("users")
    .where({
      id: id,
    })
    .then((user) => {
      if (user.length) {
        console.log(user[0]);
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch((err) => res.status(400).json("Error getting user"));
});

//put img
app.put("/image", (req, res) => {
  const { id } = req.body;
  database("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      console.log(entries[0].entries);
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json("Unable to get entries"));
});

//listen to the port 3000
app.listen(3000, () => {
  console.log("app is running on port 3000");
});
