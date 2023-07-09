const express = require("express");
const router = express.Router();
const { requiresAuth } = require("./auth");

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/subreddit.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const SubRedditService =
  grpc.loadPackageDefinition(packageDefinition).SubRedditService;
const client = new SubRedditService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

router.post("/", requiresAuth, (req, res) => {
  const { name, description } = req.body;
  const createSubredditRequest = {
    subreddit: {
      name,
      description,
    },
  };
  client.createSubReddit(createSubredditRequest, (err, msg) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, msg: "create subreddit error" });
    } else {
      return res
        .status(200)
        .json({ success: true, msg: "subreddit created", id: msg.id });
    }
  });
});
