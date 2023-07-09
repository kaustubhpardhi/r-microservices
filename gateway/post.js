const express = require("express");
const router = express.Router();
const { requiresAuth } = require("./auth");

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/post.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

const PostService = grpc.loadPackageDefinition(packageDefinition).PostService;
const client = new PostService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
router.post("/comment/:id ", requiresAuth, (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const commentPostRequest = {
    id,
    user_id: req.user.id,
    comment,
  };
  client.commentPost(commentPostRequest, (err, msg) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, msg: "comment post error" });
    } else {
      return res
        .status(200)
        .json({ sucess: true, msg: "post liked", id: msg.id });
    }
  });
});

router.get("/like/:id ", requiresAuth, (req, res) => {
  const { id } = req.params;
  client.likePost({ id, user_id: req.user.id }, (err, msg) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "like post error" });
    } else {
      return res
        .status(200)
        .json({ sucess: true, msg: "post liked", id: msg.id });
    }
  });
});
router.put("/:id", requiresAuth, (req, res) => {
  const { id } = req.params;
  const updatePostRequest = {
    id,
    post: {
      title,
      description,
    },
    user_id: req.user.id,
  };
  client.updatePost(updatePostRequest, (error, msg) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "update post error" });
    } else {
      return res
        .status(200)
        .json({ sucess: true, msg: "post returned", id: msg.id });
    }
  });
});
router.get("/:id", (req, res) => {
  const { id } = req.params;
  client.getPost({ id }, (err, msg) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "get post error" });
    } else {
      return res
        .status(200)
        .json({ sucess: true, msg: "post returned", post: msg.post });
    }
  });
});
router.post("/", requiresAuth, (req, res) => {
  const { title, description, subreddit_id } = req.body;
  if (!title || !description || !subreddit_id) {
    return res
      .status(401)
      .json({ success: false, msg: "missing fields to create post" });
  } else {
    const createPostRequest = {
      post: {
        title,
        description,
        subreddit_id,
        author: req.user.id,
      },
    };
    client.createPost(createPostRequest, (err, msg) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, msg: "create post error" });
      } else {
        return res
          .status(200)
          .json({ sucess: true, msg: "post created", id: msg.id });
      }
    });
  }
});

module.exports = router;
