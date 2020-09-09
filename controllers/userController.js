var User = require("../models/user");
var Token = require("../models/token");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const crypto = require("crypto");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
var async = require("async");

//Load config
dotenv.config({ path: "./config/config.env" });

//Setting up the Sendgrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Display Help Page on GET.
exports.user_help_get = (req, res, next) => {
  res.render("user_help", { title: "RR | Help" });
};

// Display Help Contact Page on GET.
exports.user_help_contact_get = (req, res, next) => {
  res.render("user_help_contact", { title: "RR | Contact Us" });
};

// Handle Help Contact Page on POST.
exports.user_help_contact_post = [
  body("email", "Email is required").isLength({ min: 1 }),
  body("email", "Email is not valid").isEmail(), //looks like normalizeEmail() is removing "." from email name (before @)
  body("subject", "Subject is required").isLength({ min: 1 }),
  body("description", "Description must not be empty.").isLength({ min: 1 }),

  // Sanitize fields (using wildcard).
  body("*").escape(),
  body("*").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_help_contact", {
        title: "Contact Us",
        errors: errors.mapped(),
      });
    } else {
      const mail = {
        to: process.env.ADMIN_EMAIL,
        from: process.env.ADMIN_EMAIL,
        subject: `You received this message: "${req.body.subject}" from ${req.body.email}`,
        html: req.body.description,
      };

      sgMail.send(mail, (err) => {
        if (err) {
          console.error(err);
        }
        req.flash(
          "success",
          "Your message was successfully submitted. We will contact you as soon as possible."
        );
        res.redirect("/users/help");
      });
    }
  },
];

// Display User create form on GET.
exports.user_create_get = (req, res, next) => {
  res.render("user_form", { title: "Register User" });
};

// Handle User create on POST.
exports.user_create_post = [
  body("name", "Name is required").isLength({ min: 1 }),
  body("email", "Email is required").isLength({ min: 1 }),
  body("email", "Email is not valid")
    .isEmail() //looks like normalizeEmail() is removing "." from email name (before @)
    .custom((value, { req }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (err) {
            reject(new Error("Server Error"));
          }
          if (Boolean(user)) {
            reject(new Error("E-mail already in use"));
          }
          resolve(true);
        });
      });
    }),
  body("username", "Username is required").isLength({ min: 1 }),
  body(
    "password",
    "Password must be at least 6 characters long and include one lowercase character, one uppercase character, a number, and a special character."
  ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/, "i"),
  body("password2", "Passwords should match").custom((value, { req }) => {
    return value === req.body.password;
  }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_form", {
        errors: errors.mapped(),
      });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) {
            console.error(err);
          }
          user.password = hash;

          user.save((err) => {
            if (err) {
              console.error(err);
            }
            // Create a verification token for this user
            var token = new Token({
              _userId: user._id,
              token: crypto.randomBytes(16).toString("hex"),
            });

            // Save the verification token
            token.save((err) => {
              if (err) {
                console.error(err);
              }
              // Send email for confirmation of the user register
              const mail = {
                to: user.email,
                from: process.env.ADMIN_EMAIL,
                subject: "Account Verification Token",
                html: `Hello ${user.username},
                    <br>
                    <br>
                    Please verify your account with Romanian Reporter by clicking the link below: 
                    <br>
                    <br>
                    <a href=http://${req.headers.host}/users/confirmation/${token.token} target="_blank">http://${req.headers.host}/users/confirmation/${token.token}</a>.`,
              };

              sgMail.send(mail, (err) => {
                if (err) {
                  console.error(err);
                }
                req.flash(
                  "success",
                  "A verification email has been sent to " + user.email + "."
                );
                res.redirect("/users/login");
              });
            });
          });
        });
      });
    }
  },
];

// Display User login form on GET.
exports.user_login_get = (req, res, next) => {
  res.render("user_login", { title: "Login" });
};

// Handle User login form on POST.
exports.user_login_post = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
};

// Display Confirmation of User on GET.
exports.user_confirmation_get = (req, res, next) => {
  res.render("user_confirmation", {
    title: "Verify Account Creation",
    secretToken: req.params.id,
  });
};

// Handle Confirmation of User on POST.
exports.user_confirmation_post = [
  body("email", "Email is required").isLength({ min: 1 }),
  body("email", "Email is not valid").isEmail(), //looks like normalizeEmail() is removing "." from email name (before @)
  body("token", "Token is required").isLength({ min: 1 }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_confirmation", {
        title: "Verify Account Creation",
        secretToken: req.params.id,
        errors: errors.mapped(),
      });
    } else {
      async.parallel(
        {
          // Find a matching token
          // Because I used the async middleware and the format below, I added the prefix "token" and "user" to all
          // token and user related properties below
          token: (callback) => {
            Token.findOne({ token: req.body.token }).exec(callback);
          },
        },
        (err, token) => {
          if (err) {
            return next(err);
          }
          // Token is set to expire after 12 hours
          if (!token.token) {
            req.flash(
              "danger",
              "We were unable to find a valid token. Your token may have expired."
            );
            res.redirect("/users/resend");
          } else {
            async.parallel(
              {
                // If we found a token, find a matching user
                // Because I used the async middleware and the format below, I added the prefix "token" and "user" to all
                // token and user related properties below
                user: (callback) => {
                  User.findOne({
                    _id: token.token._userId,
                    email: req.body.email,
                  }).exec(callback);
                },
              },
              (err, user) => {
                if (err) {
                  return next(err);
                }
                if (!user.user) {
                  req.flash(
                    "danger",
                    "We were unable to find an user for this token."
                  );
                  res.redirect("/users/resend");
                  return;
                }
                if (user.user.isVerified) {
                  req.flash("danger", "This user has already been verified.");
                  res.redirect("/users/resend");
                  return;
                }

                //Mark as Verified and save the user
                user.user.isVerified = true;
                user.user.markModified("isVerified");
                user.user.save((err) => {
                  if (err) {
                    console.error(err);
                  }
                  //Delete the token from DB
                  Token.findByIdAndRemove(token.token._id, function deleteToken(
                    err
                  ) {
                    if (err) {
                      return next(err);
                    }
                  });

                  req.flash(
                    "success",
                    "The account has been verified. Please log in."
                  );
                  res.redirect("/users/login");
                });
              }
            );
          }
        }
      );
    }
  },
];

// Display Resending of Token on GET.
exports.resend_token_get = (req, res, next) => {
  res.render("user_resend", {
    title: "Resend Token",
  });
};

// Handle Resending of Token on POST.
exports.resend_token_post = [
  body("email", "Email is required").isLength({ min: 1 }),
  body("email", "Email is not valid").isEmail(), //looks like normalizeEmail() is removing "." from email name (before @)

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_resend", {
        title: "Resend Token",
        errors: errors.mapped(),
      });
    } else {
      async.parallel(
        {
          // Find the user with this email in the DB
          // Because I used the async middleware and the format below, I added the prefix "user" to all user related properties below
          user: (callback) => {
            User.findOne({ email: req.body.email }).exec(callback);
          },
        },
        (err, user) => {
          if (err) {
            return next(err);
          }
          // No user with this email found in DB
          if (!user.user) {
            req.flash(
              "danger",
              "We were unable to find an user with that email."
            );
            res.redirect("/users/login");
            return;
          }
          // User found, but is marked as verified in DB
          if (user.user.isVerified) {
            req.flash(
              "danger",
              "This account has already been verified. Please log in."
            );
            res.redirect("/users/login");
            return;
          }

          // Create a verification token for this user
          var token = new Token({
            _userId: user.user._id,
            token: crypto.randomBytes(16).toString("hex"),
          });

          // Save the verification token
          token.save((err) => {
            if (err) {
              console.error(err);
            }

            const mail = {
              to: user.user.email,
              from: process.env.ADMIN_EMAIL,
              subject: "Account Verification Token",
              html: `Hello ${user.user.username},
                <br>
                <br>
                Please verify your account with Romanian Reporter by clicking the link below: 
                <br>
                <br>
                <a href=http://${req.headers.host}/users/confirmation/${token.token} target="_blank">http://${req.headers.host}/users/confirmation/${token.token}</a>.`,
            };

            sgMail.send(mail, (err) => {
              if (err) {
                console.error(err);
              }
              req.flash(
                "success",
                "A verification email has been sent to " + user.user.email + "."
              );
              res.redirect("/users/login");
            });
          });
        }
      );
    }
  },
];

// Display Password Reset Email Sending on GET.
exports.reset_password_email_get = (req, res, next) => {
  res.render("user_pass_reset_email", {
    title: "Password Reset",
  });
};

// Handle Password Reset Email Sending on POST.
exports.reset_password_email_post = [
  body("email", "Email is required").isLength({ min: 1 }),
  body("email", "Email is not valid").isEmail(), //looks like normalizeEmail() is removing "." from email name (before @)

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_pass_reset_email", {
        title: "Password Reset",
        errors: errors.mapped(),
      });
    } else {
      async.parallel(
        {
          // Find the user with this email in the DB
          // Because I used the async middleware and the format below, I added the prefix "user" to all user related properties below
          user: (callback) => {
            User.findOne({ email: req.body.email }).exec(callback);
          },
        },
        (err, user) => {
          if (err) {
            return next(err);
          }
          // No user with this email found in DB
          if (!user.user) {
            req.flash(
              "danger",
              "We were unable to find an user with that email."
            );
            res.redirect("/users/login");
            return;
          }

          // Create a verification token for this user
          var token = new Token({
            _userId: user.user._id,
            token: crypto.randomBytes(16).toString("hex"),
          });

          // Save the verification token
          token.save((err) => {
            if (err) {
              console.error(err);
            }

            // Send email with link for password reset
            const mail = {
              to: user.user.email,
              from: process.env.ADMIN_EMAIL,
              subject: "Confirm password reset",
              html: `Hello ${user.user.username},
                <br>
                <br>
                Please click the following link to reset your password: 
                <br>
                <br>
                <a href=http://${req.headers.host}/users/password-reset/${token.token} target="_blank">http://${req.headers.host}/users/password-reset/${token.token}</a>.
                <br>
                <br>
                If you did not request that your password be reset, you can safely ignore this email. It's likely that another person has mistakenly attempted to log in using your email. As long as you do not click the link above, no action will be taken and your account will remain secure.
                <br>
                <br>
                The Romanian Reporter Team`,
            };

            sgMail.send(mail, (err) => {
              if (err) {
                console.error(err);
              }
              req.flash(
                "success",
                "A verification email has been sent to " + user.user.email + "."
              );
              res.redirect("/users/login");
            });
          });
        }
      );
    }
  },
];

// Display Password Reset on GET.
exports.reset_password_get = (req, res, next) => {
  res.render("user_pass_reset", {
    title: "Password Reset",
    secretToken: req.params.id,
  });
};

// Handle Password Reset on POST.
exports.reset_password_post = [
  body(
    "password",
    "Password must be at least 6 characters long and include one lowercase character, one uppercase character, a number, and a special character."
  ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/, "i"),
  body("password2", "Passwords should match").custom((value, { req }) => {
    return value === req.body.password;
  }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_pass_reset", {
        title: "Password Reset",
        secretToken: req.params.id,
        errors: errors.mapped(),
      });
    } else {
      async.parallel(
        {
          // Find a matching token
          // Because I used the async middleware and the format below, I added the prefix "token" and "user" to all
          // token and user related properties below
          token: (callback) => {
            Token.findOne({ token: req.body.token }).exec(callback);
          },
        },
        (err, token) => {
          if (err) {
            return next(err);
          }
          // Token is set to expire after 12 hours
          if (!token.token) {
            req.flash(
              "danger",
              "We were unable to find a valid password reset request. Your link may have expired."
            );
            res.redirect("/users/password-reset");
          } else {
            async.parallel(
              {
                // If we found a token, find a matching user
                // Because I used the async middleware and the format below, I added the prefix "token" and "user" to all
                // token and user related properties below
                user: (callback) => {
                  User.findOne({
                    _id: token.token._userId,
                  }).exec(callback);
                },
              },
              (err, user) => {
                if (err) {
                  return next(err);
                }
                if (!user.user) {
                  req.flash(
                    "danger",
                    "We were unable to find an user for this password reset request."
                  );
                  res.redirect("/users/password-reset");
                  return;
                }

                //Hash the password and save it in DB
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) {
                      console.error(err);
                    }
                    user.user.password = hash;

                    user.user.markModified("password");
                    user.user.save((err) => {
                      if (err) {
                        console.error(err);
                      }

                      //Delete the token from DB
                      Token.findByIdAndRemove(
                        token.token._id,
                        function deleteToken(err) {
                          if (err) {
                            return next(err);
                          }
                        }
                      );

                      // Send email to confirm password reset
                      const mail = {
                        to: user.user.email,
                        from: process.env.ADMIN_EMAIL,
                        subject: "Romanian Reporter - password changed",
                        html: `Hello ${user.user.username},
                          <br>
                          <br>
                          This is a notice to let you know that the password for your account has been changed.
                          <br>
                          <br>
                          If you did not recently reset or change your password, it is possible that your account has been compromised. If you have any questions about this, please contact us at ${process.env.ADMIN_EMAIL}
                          <br>
                          <br>
                          The Romanian Reporter Team`,
                      };

                      sgMail.send(mail, (err) => {
                        if (err) {
                          console.error(err);
                        }
                      });

                      req.flash(
                        "success",
                        "The password has been successfully reset. Please log in."
                      );
                      res.redirect("/users/login");
                    });
                  });
                });
              }
            );
          }
        }
      );
    }
  },
];

// Display User Account Details on GET.
exports.user_account_get = (req, res, next) => {
  async.parallel(
    {
      user: (callback) => {
        User.findOne({ email: req.user.email }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("user_account", {
        title: "Account Information",
        user: results.user,
      });
    }
  );
};

// Handle Password Change (from User Account Page) on POST.
exports.user_account_post = [
  body("currentpassword", "Please enter your current password").isLength({
    min: 1,
  }),
  body(
    "newpassword",
    "New password should not match the current password"
  ).custom((value, { req }) => {
    return value !== req.body.currentpassword;
  }),
  body(
    "newpassword",
    "Password must be at least 6 characters long and include one lowercase character, one uppercase character, a number, and a special character."
  ).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/, "i"),
  body("newpassword2", "Passwords should match").custom((value, { req }) => {
    return value === req.body.newpassword;
  }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      async.parallel(
        {
          user: (callback) => {
            User.findOne({ email: req.user.email }).exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          //Successful, so render
          res.render("user_account", {
            title: "Account Information",
            user: results.user,
            errors: errors.mapped(),
          });
        }
      );
    } else {
      async.parallel(
        {
          user: (callback) => {
            User.findOne({ email: req.user.email }).exec(callback);
          },
        },
        (err, user) => {
          if (err) {
            return next(err);
          }
          //Match Password
          bcrypt.compare(
            req.body.currentpassword,
            user.user.password,
            (err, isMatch) => {
              if (err) throw err;
              if (!isMatch) {
                req.flash("danger", "Invalid Password");
                res.redirect("/users/account");
                return;
              } else {
                //Hash the password and save it in DB
                bcrypt.genSalt(10, (err, salt) => {
                  bcrypt.hash(req.body.newpassword, salt, (err, hash) => {
                    if (err) {
                      return next(err);
                    }
                    user.user.password = hash;

                    user.user.markModified("password");
                    user.user.save((err) => {
                      if (err) {
                        return next(err);
                      }

                      // Send email to confirm password change
                      const mail = {
                        to: user.user.email,
                        from: process.env.ADMIN_EMAIL,
                        subject: "Romanian Reporter - password changed",
                        html: `Hello ${user.user.username},
                                <br>
                                <br>
                                This is a notice to let you know that the password for your account has been changed.
                                <br>
                                <br>
                                If you did not recently reset or change your password, it is possible that your account has been compromised. If you have any questions about this, please contact us at ${process.env.ADMIN_EMAIL}
                                <br>
                                <br>
                                The Romanian Reporter Team`,
                      };

                      sgMail.send(mail, (err) => {
                        if (err) {
                          return next(err);
                        }
                      });
                      req.logout();
                      req.flash(
                        "success",
                        "The password has been successfully changed. Please log in again."
                      );
                      res.redirect("/users/login");
                      return;
                    });
                  });
                });
              }
            }
          );
        }
      );
    }
  },
];

// Display User Profile Edit on GET.
exports.user_profile_edit_get = (req, res, next) => {
  async.parallel(
    {
      user: (callback) => {
        User.findOne({ email: req.user.email }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      //Successful, so render
      res.render("user_account_edit", {
        title: "Edit Profile",
        user: results.user,
      });
    }
  );
};

// Handle User Profile Edit on POST.
exports.user_profile_edit_post = [
  body("name", "Name is required").isLength({ min: 1 }),
  body("email", "Email is required").isLength({ min: 1 }),
  body("email", "Email is not valid")
    .isEmail() //looks like normalizeEmail() is removing "." from email name (before @)
    .custom((value, { req }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (err) {
            reject(new Error("Server Error"));
          }
          if (Boolean(user)) {
            // For cases when the email remains unchanged, we need to allow the other changes to be submitted
            // so we rule out the case when the user found is the same with logged user
            if (user.email !== req.user.email) {
              reject(new Error("E-mail already in use"));
            }
          }
          resolve(true);
        });
      });
    }),
  body("username", "Username is required").isLength({ min: 1 }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      isVerified: true,
      _id: req.user._id, // the id of the logged user, otherwise it will create a new user
    });

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          user: (callback) => {
            User.findOne({ email: req.user.email }).exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("user_account_edit", {
            title: "Edit Profile",
            user: results.user,
            errors: errors.mapped(),
          });
        }
      );
    } else {
      // Data from form is valid. Update the record.
      User.findByIdAndUpdate(req.user._id, user, {}, (err, user) => {
        if (err) {
          return next(err);
        }
        // Successful - redirect to user account page.
        res.redirect("/users/account");
      });
    }
  },
];

// Display Delete Account on GET.
exports.user_delete_get = (req, res, next) => {
  async.parallel(
    {
      user: (callback) => {
        User.findOne({ email: req.user.email }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("user_delete", {
        title: "Delete Account",
        user: results.user,
      });
    }
  );
};

// Handle Delete Account on POST.
exports.user_delete_post = (req, res, next) => {
  async.parallel(
    {
      user: (callback) => {
        User.findOne({ email: req.user.email }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success

      // Delete user and redirect to home page.
      User.findByIdAndRemove(results.user._id, function deleteUser(err) {
        if (err) {
          return next(err);
        }

        // Success - go to home page
        req.logout();
        req.flash("success", "You account is deleted.");
        res.redirect("/");
      });
    }
  );
};

// Display User logout on GET.
exports.user_logout_get = (req, res) => {
  req.logout();
  req.flash("success", "You are logged out.");
  res.redirect("/users/login");
};
