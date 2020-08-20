var express = require("express");
var router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");

// Require controller modules.
var article_controller = require("../controllers/articleController");

/// ARTICLE ROUTES ///

// GET request for creating an Article. NOTE This must come before route that displays Article (uses id).
router.get(
  "/create",
  ensureAuthenticated,
  article_controller.article_create_get
);

//POST request for creating Article.
router.post("/create", article_controller.article_create_post);

// GET request to delete Article.
router.get("/:id/delete", ensureAdmin, article_controller.article_delete_get);

// POST request to delete Article.
router.post("/:id/delete", article_controller.article_delete_post);

// GET request to update Article.
router.get("/:id/update", ensureAdmin, article_controller.article_update_get);

// POST request to update Article.
router.post("/:id/update", article_controller.article_update_post);

// GET request for one Article.
router.get("/:id", article_controller.article_detail);

// GET request for list of all Articles.
router.get("/", article_controller.article_list);

module.exports = router;
