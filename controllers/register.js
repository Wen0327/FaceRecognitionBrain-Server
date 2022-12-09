const handleRegister = (req, res, database, bcrypt) => {
  const { email, name, password } = req.body;
  if(!email || !name || !password){
    return res.status(400).json('incorrect from submission');
  }
  const hash = bcrypt.hashSync(password);

  database.transaction((trx) => {
      trx.insert({
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
};

module.exports = {
  handleRegister: handleRegister,
};
