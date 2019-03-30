const express = require("express");
const router = express();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Load Post Validation
const validatePostInput = require("../../validation/post");

/**
 * @route GET /api/posts/
 * @description Retrieve all posts
 * @access Private
 */
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found" }));
});

/**
 * @route GET /api/posts/:post_id
 * @description Retrieve a posts by post ID
 * @access Private
 */
router.get("/:post_id", (req, res) => {
  Post.findById(req.params.post_id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that id" })
    );
});

/**
 * @route POST /api/posts/
 * @description Create Post
 * @access Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if (!isValid) {
      res.status(400).json(errors);
    } else {
      // Input data is valid -> Create new post
      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar
      });

      newPost.save().then(post => res.json(post));
    }
  }
);

/**
 * @route DELETE /api/posts/:post_id
 * @description Retrieve a posts by post ID
 * @access Private
 */
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "User not authorized" });
        } else {
          Post.deleteOne({ _id: req.params.post_id }).then(() =>
            res.json({ success: true })
          );
        }
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

/**
 * @route POST /api/posts/like/:post_id
 * @description Add user to post's like array
 * @access Private
 */
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length > 0
        ) {
          res
            .status(400)
            .json({ alreadyliked: "User already liked this post" });
        } else {
          post.likes.push({ user: req.user.id });
          post.save().then(post => {
            res.json(post);
          });
        }
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

/**
 * @route POST /api/posts/unlike/:post_id
 * @description Remove user from post's like array
 * @access Private
 */
router.post(
  "/unlike/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          res
            .status(400)
            .json({ alreadyliked: "User has not liked this post" });
        } else {
          // get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          // Splice it out
          post.likes.splice(removeIndex, 1);

          post.save().then(post => res.json(post));
        }
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

/**
 * @route POST /api/posts/comment/:post_id
 * @description Add a comment to post's comment array
 * @access Private
 */
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        const { errors, isValid } = validatePostInput(req.body);
        // Check validation
        if (!isValid) {
          res.status(400).json(errors);
        } else {
          // Create new comment obj
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar
          };

          // Add to comments array
          post.comments.unshift(newComment);

          post.save().then(post => res.json(post));
        }
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

/**
 * @route DELETE /api/posts/comment/:post_id/:comment_id
 * @description Remove a comment from a post's comment array
 * @access Private
 */
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        // Check if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          res
            .status(404)
            .json({ nocomment: "Couldn't delete comment. Comment not found." });
        } else {
          // Get remove index
          const removeIndex = post.comments
            .map(comment => comment._id.toString())
            .indexOf(req.params.comment_id);
          // // Splice it out
          post.comments.splice(removeIndex, 1);

          post.save().then(post => res.json(post));
        }
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

module.exports = router;
