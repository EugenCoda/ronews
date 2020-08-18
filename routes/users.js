var express = require("express");
var router = express.Router();
const { ensureGuest, ensureAuthenticated } = require("../middleware/auth");

// Require controller module.
var user_controller = require("../controllers/userController");

/// USER ROUTES ///

// Help Page
router.get("/help", user_controller.user_help_get);

// GET Contact Page
router.get("/help/contact", user_controller.user_help_contact_get);

// POST Contact Page
router.post("/help/contact", user_controller.user_help_contact_post);

// Register Form
router.get("/register", ensureGuest, user_controller.user_create_get);

// POST request for registering User.
router.post("/register", user_controller.user_create_post);

// GET request User Login Form
router.get("/login", ensureGuest, user_controller.user_login_get);

// POST request for Login User.
router.post("/login", user_controller.user_login_post);

// GET request for Confirmation of User.
router.get(
  "/confirmation/:id",
  ensureGuest,
  user_controller.user_confirmation_get
);

// POST request for Confirmation of User.
router.post("/confirmation/:id", user_controller.user_confirmation_post);

// GET request for Resending the Token.
router.get("/resend", ensureGuest, user_controller.resend_token_get);

// POST request for Resending the Token.
router.post("/resend", user_controller.resend_token_post);

// GET request for Password Reset Email Sending.
router.get(
  "/password-reset",
  ensureGuest,
  user_controller.reset_password_email_get
);

// POST request for Password Reset Email Sending.
router.post("/password-reset", user_controller.reset_password_email_post);

// GET request for Handling Password Reset.
router.get(
  "/password-reset/:id",
  ensureGuest,
  user_controller.reset_password_get
);

// POST request for Handling Password Reset.
router.post("/password-reset/:id", user_controller.reset_password_post);

//User Account Details
router.get("/account", ensureAuthenticated, user_controller.user_account_get);

//POST request for Changing Password from User Account Page
router.post("/account", user_controller.user_account_post);

//GET request User Profile Edit
router.get(
  "/account/edit",
  ensureAuthenticated,
  user_controller.user_profile_edit_get
);

//POST request User Profile Edit
router.post("/account/edit", user_controller.user_profile_edit_post);

// GET Delete Account
router.get(
  "/account/delete",
  ensureAuthenticated,
  user_controller.user_delete_get
);

// POST Delete Account
router.post("/account/delete", user_controller.user_delete_post);

//User Logout
router.get("/logout", user_controller.user_logout_get);

module.exports = router;
