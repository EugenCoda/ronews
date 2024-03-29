const createError = require("http-errors");
const express = require("express");
var favicon = require("serve-favicon");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const connectDB = require("./config/db");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var articlesRouter = require("./routes/articles");
var categoriesRouter = require("./routes/categories");
var adminRouter = require("./routes/admin");

var compression = require("compression");
var helmet = require("helmet");

//Load config
dotenv.config({ path: "./config/config.env" });

//Set up mongoose connection
connectDB();

const app = express();
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "connect-src": [
          "'self'",
          "cdn.ckeditor.com",
          "www.google-analytics.com",
        ],
        "script-src": [
          "'self'",
          "code.jquery.com",
          "cdn.jsdelivr.net",
          "stackpath.bootstrapcdn.com",
          "cdn.ckeditor.com",
          "ckeditor.iframe.ly",
          "cdnjs.cloudflare.com",
          "www.google-analytics.com",
          "www.googletagmanager.com",
          "connect.facebook.net",
          "platform.twitter.com",
          "platform.linkedin.com",
          "'unsafe-inline'",
        ],
        "style-src": [
          "'self'",
          "cdn.jsdelivr.net",
          "stackpath.bootstrapcdn.com",
          "cdn.ckeditor.com",
          "ckeditor.com",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
          "'unsafe-inline'",
        ],
        "font-src": [
          "'self'",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
          "fonts.gstatic.com",
        ],
        "img-src": [
          "'self'",
          "romanianreporter.com",
          "www.google-analytics.com",
          "cdn.ckeditor.com",
          "cdnjs.cloudflare.com",
          "syndication.twitter.com",
          "data:",
        ],
        "frame-src": [
          "'self'",
          "www.youtube.com",
          "www.facebook.com",
          "web.facebook.com",
          "platform.twitter.com",
        ],
      },
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Loading the environment variables to pug templates
app.locals.env = process.env;

//Moment - date formatting
app.locals.moment = require("moment"); //for formatting the date in the pug template

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Cookie Parser
app.use(cookieParser());

//Compress all routes
app.use(compression());

//Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

//Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Express Messages Middleware
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Passport Config
require("./config/passport")(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set up a global variable for user
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/articles", articlesRouter);
app.use("/categories", categoriesRouter);
app.use("/dashboard", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
