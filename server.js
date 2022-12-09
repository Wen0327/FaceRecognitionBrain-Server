const express = require("express");
// Express >= 4.16.0
// body parser has been re-added under the methods
// express.json() and express.urlencoded()
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

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
app.post("/SignIn", (req, res) => {
  //Check whether the pw match
  database.select("email", "hash").from('login').where("email", "=", req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        //remember to return
        return database.select("*").from("users").where("email", "=", req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json("Unable Sign in(1)"))
      } else {
        res.status(400).json("Unable Sign in(2)");
      }
    })
    .catch(err => res.status(400).json("Unable Sign in(3)"))
});

//Register, the users can not be the same
app.post("/Register", (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  database
    .transaction((trx) => {
      trx
        .insert({
          hash: hash,
          email: email,
        })
        .into("login")
        .returning("email")
        .then((loginEmail) => {
          return trx("users")
            .returning("*")
            .insert({
              //use loginEmail[0] instead of loginEmail to get the array's data
              email: loginEmail[0].email,
              name: name,
              joined: new Date(),
            })
            .then((user) => {
              res.json(user[0]);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch((err) =>
      res.status(400).json("The register email has already exists")
    );
});

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
