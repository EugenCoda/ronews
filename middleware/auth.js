const dotenv = require("dotenv");
//Load config
dotenv.config({ path: "./config/config.env" });

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("danger", "Please login");
      res.redirect("/users/login");
    }
  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect("/");
    } else {
      return next();
    }
  },

  ensureAdmin: function (req, res, next) {
    if (req.isAuthenticated() && req.user.email == process.env.ADMIN_EMAIL) {
      return next();
    } else {
      req.flash("danger", "You are not authorized to view this page");
      res.redirect("/");
    }
  },
};
