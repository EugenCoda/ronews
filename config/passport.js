const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = (passport) => {
  //Local Strategy
  passport.use(
    new LocalStrategy((username, password, done) => {
      //Match Username
      let query = { username: username };
      User.findOne(query, (err, user) => {
        if (err) throw err;
        if (!user) {
          return done(null, false, { message: "Invalid credentials" }); //we shouldn't have different messages for security reasons
        }
        //Match Password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid credentials" }); //we shouldn't have different messages for security reasons
          }
        });
        // Make sure the user has been verified
        if (!user.isVerified) {
          return done(null, false, {
            message: "Your account has not been verified.",
          });
        }
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
