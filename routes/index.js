var express = require("express");
var router = express.Router();

// Require controller modules.
var index_controller = require("../controllers/indexController");

/// HOME PAGE ROUTES ///

/* GET main page. */
router.get("/", index_controller.main_page);

module.exports = router;
