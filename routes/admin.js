var express = require("express");
var router = express.Router();
const { ensureAdmin } = require("../middleware/auth");

// Require controller module.
var admin_controller = require("../controllers/adminController");

/// ADMIN ROUTES ///

// GET Dashboard
router.get("/", ensureAdmin, admin_controller.admin_dashboard_get);

// GET Pending Articles
router.get("/articles", ensureAdmin, admin_controller.admin_articles_get);

// POST Approving Articles
router.post("/articles", ensureAdmin, admin_controller.admin_articles_post);

// GET Recommended Articles
router.get(
  "/articles-recommended",
  ensureAdmin,
  admin_controller.admin_articles_recommended_get
);

// POST Recommended Articles
router.post(
  "/articles-recommended",
  ensureAdmin,
  admin_controller.admin_articles_recommended_post
);

// GET Pending Categories
router.get("/categories", ensureAdmin, admin_controller.admin_categories_get);

// POST Approving Categories
router.post("/categories", ensureAdmin, admin_controller.admin_categories_post);

// GET Pending Comments
router.get("/comments", ensureAdmin, admin_controller.admin_comments_get);

// POST Approving Comments
router.post("/comments", ensureAdmin, admin_controller.admin_comments_post);

module.exports = router;
