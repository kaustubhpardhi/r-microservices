const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Client } = require("pg");
const clientConfig = {
  user: "postgres",
  database: "reddit-backend",
  password: "kaustubh786",
};

const client = new Client(clientConfig);
client.connect();

//service to create a user
exports.createUser = function createUser(call, cb) {
  const { username, email, password } = call.request.user;
  //hash the password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return cb(err, null);
    }
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        return cb(err, null);
      }

      client.query(
        "insert into users (username,email,password) values ($1,$2,$3) returning id",
        [username, email, hash],
        (err, res) => {
          if (err) {
            return cb(err, null);
          }
          const response = {
            id: res.rows[0],
          };
          return cb(null, response);
        }
      );
    });
  });
};

//service to get a user from db
exports.getUser = function getUser(call, cb) {
  const { id } = call.request;
  client.query(
    "select username,email from users where id=$1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      } else {
        const response = {
          user: {
            username: res.rows[0].username,
            email: res.rows[0].email,
            id,
          },
        };
        return cb(null, response);
      }
    }
  );
};

exports.createToken = function createToken(call, cb) {
  const user = call.request.user;

  //1. query the db for user with given email
  //2. check if passwords match
  //3. create token with username and email and id

  client.query(
    "select id,username,password from users where email = $1",
    [user.email],
    (err, res) => {
      if (err) {
        return cb(err, null);
      } else {
        bcrypt.compare(user.password, res.rows[0].password, (err, ok) => {
          if (err) return cb(err, null);
          if (ok) {
            user.id = res.rows[0].id;
            user.username = res.rows[0].username;
            jwt.sign(user, "SECRET", (err, token) => {
              if (err) return cb(err.null);
              const response = {
                token,
              };
              return cb(null, response);
            });
          }
          if (!ok) {
            return cb(new Error("Incorrect Password"), null);
          }
        });
      }
    }
  );
};

exports.isAuthenticated = function isAuthenticated(call, cb) {
  const token = call.request.token;
  jwt.verify(token, "SECRET", (err, user) => {
    if (err) return cb(err, { ok: false });
    else {
      const response = {
        ok: true,
        user: user,
      };
      return cb(null, response);
    }
  });
};
