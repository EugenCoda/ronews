var express = require("express");
var cors = require("cors");
var router = express.Router();

// Require controller modules.
var index_controller = require("../controllers/indexController");

/// HOME PAGE ROUTES ///

/* GET main page. */
router.get("/", index_controller.main_page);

/* GET exchange rate. */
router.get("/exchange", index_controller.exchange_rate);

// GET request for SEARCH.
router.get("/search", cors(), index_controller.search);

module.exports = router;
