const { Client } = require("pg");
const clientConfig = {
  user: "postgres",
  database: "reddit-backend",
  password: "kaustubh786",
};

const client = new Client(clientConfig);
client.connect();

exports.createSubreddit = function createSubreddit(call, cb) {
  const { name, description } = call.reques.sureddit;
  client.query(
    "insert into subreddit(name,description) values ($1,$2) returning id",
    [name, description],
    (err, res) => {
      if (err) {
        return cb(err, null);
      } else {
        const response = {
          id: res.rows[0].id,
        };
        return cb(null, response);
      }
    }
  );
};

exports.getSubreddit = function getSubreddit(call, cb) {
  const { id } = call.request;
  client.query(
    "select name,description from subreddits where id = $1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      } else {
        const response = {
          subreddit: {
            name: res.rows[0].name,
            description: res.rows[0].description,
            subreddit_id: id,
          },
        };
        return cb(null, response);
      }
    }
  );
};
