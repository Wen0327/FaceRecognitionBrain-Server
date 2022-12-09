const handleSignIn = (req, res, database, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("incorrect from submission");
  }
  //Check whether the pw match
  database
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        //remember to return
        return database
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("Unable Sign in(1)"));
      } else {
        res.status(400).json("Unable Sign in(2)");
      }
    })
    .catch((err) => res.status(400).json("Unable Sign in(3)"));
};

module.exports = {
  handleSignIn: handleSignIn,
};
