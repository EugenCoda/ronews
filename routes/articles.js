var express = require("express");
var router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/auth");

// Require controller modules.
var article_controller = require("../controllers/articleController");
var index_controller = require("../controllers/indexController");

/// ARTICLE ROUTES ///

// GET request for creating an Article. NOTE This must come before route that displays Article (uses id).
router.get("/create", ensureAdmin, article_controller.article_create_get);

//POST request for creating Article.
router.post("/create", article_controller.article_create_post);

// GET request to delete Article.
router.get(
  "/:id/:slug/delete",
  ensureAdmin,
  article_controller.article_delete_get
);

// POST request to delete Article.
router.post("/:id/:slug/delete", article_controller.article_delete_post);

// GET request to update Article.
router.get(
  "/:id/:slug/update",
  ensureAdmin,
  article_controller.article_update_get
);

// POST request to update Article.
router.post("/:id/:slug/update", article_controller.article_update_post);

// GET request for one Article.
router.get("/:id/:slug", article_controller.article_detail_get);

// POST request for one Article (Image Upload).
router.post("/:id/:slug", ensureAdmin, article_controller.article_detail_post);

// GET request for list of all Articles.
router.get("/", ensureAdmin, article_controller.article_list);

/* GET exchange rate - from INDEX. */
router.get("/:id/:slug/exchange", index_controller.exchange_rate);

module.exports = router;
