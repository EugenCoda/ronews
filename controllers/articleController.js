var Article = require("../models/article");
var Category = require("../models/category");
var Comment = require("../models/comment");
var User = require("../models/user");
var async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Articles.
exports.article_list = function (req, res, next) {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      article_list: (callback) => {
        // Show it only if it's verified or created by the logged user
        Article.find({ $or: [{ isVerified: true }, { createdBy: req.user }] })
          .skip((page - 1) * pagination)
          .limit(pagination)
          .populate("article")
          .populate("createdBy")
          .sort([["createdAt", "ascending"]])
          .exec(callback);
      },

      article_count: (callback) => {
        // Count it only if it's verified or created by the logged user
        Article.countDocuments(
          { $or: [{ isVerified: true }, { createdBy: req.user }] },
          callback
        );
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("article_list", {
        title: "Articles",
        page: page,
        pagination: pagination,
        article_list: results.article_list,
        article_count: results.article_count,
      });
    }
  );
};

// Display Article create form on GET.
exports.article_create_get = function (req, res, next) {
  // Get all categories and comments, which we can use for adding to our article.
  async.parallel(
    {
      categories: (callback) => {
        Category.find(callback);
      },
      comments: (callback) => {
        Comment.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("article_form", {
        title: "Add Article",
        categories: results.categories,
        comments: results.comments,
      });
    }
  );
};

// Handle Article create on POST.
exports.article_create_post = [
  // Validate that the name field is not empty.
  body("title", "Article title required").trim().isLength({ min: 1 }),
  body("text", "Text required").trim().isLength({ min: 1 }),
  body("category").trim().optional(),

  // Sanitize (escape) the name field.
  body("title").escape(),
  body("text").escape(),
  body("category").escape(),
  body("title").unescape(), //not sure if it is safe to do so
  body("text").unescape(), //not sure if it is safe to do so
  body("category").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    var article = new Article({
      title: req.body.title,
      text: req.body.text,
      category: req.body.category,
      createdBy: req.user,
      updatedBy: req.user,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.

      // Get all categories and comments, which we can use for adding to our article.
      async.parallel(
        {
          categories: (callback) => {
            Category.find(callback);
          },
          comments: (callback) => {
            Comment.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          res.render("article_form", {
            title: "Add Article",
            categories: results.categories,
            comments: results.comments,
            article: article,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid.
      // Check if Article with same title already exists.
      Article.findOne({ name: req.body.title }).exec(function (
        err,
        found_article
      ) {
        if (err) {
          return next(err);
        }

        if (found_article) {
          // Article exists, redirect to its detail page. TODO: maybe just throw a warning that the title is used?
          res.redirect(found_article.url);
        } else {
          article.save(function (err) {
            if (err) {
              return next(err);
            }
            // Article saved. Redirect to article detail page.
            res.redirect(article.url);
          });
        }
      });
    }
  },
];

// Display Article delete form on GET.
exports.article_delete_get = function (req, res, next) {
  async.parallel(
    {
      article: function (callback) {
        Article.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.article == null) {
        // No results.
        res.redirect("/articles");
      }
      // Successful, so render.
      res.render("article_delete", {
        title: "Delete Article",
        article: results.article,
      });
    }
  );
};

// Handle Article delete on POST.
exports.article_delete_post = function (req, res, next) {
  async.parallel(
    {
      article: function (callback) {
        Article.findById(req.body.articleid).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      Article.findByIdAndRemove(req.body.articleid, function deleteArticle(
        err
      ) {
        if (err) {
          return next(err);
        }
        // Success - go to article list
        res.redirect("/articles");
      });
    }
  );
};

// Display article update form on GET.
exports.article_update_get = (req, res, next) => {
  // Get article, categories for form.
  async.parallel(
    {
      article: (callback) => {
        Article.findById(req.params.id)
          .populate("createdBy")
          .populate("category")
          .exec(callback);
      },
      categories: (callback) => {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.article == null) {
        // No results.
        var err = new Error("Article not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected categories as checked.
      for (
        var all_c_iter = 0;
        all_c_iter < results.categories.length;
        all_c_iter++
      ) {
        for (
          var article_c_iter = 0;
          article_c_iter < results.article.category.length;
          article_c_iter++
        ) {
          if (
            results.categories[all_c_iter]._id.toString() ==
            results.article.category[article_c_iter]._id.toString()
          ) {
            results.categories[all_c_iter].checked = "true";
          }
        }
      }
      res.render("article_form", {
        title: "Update Article",
        categories: results.categories,
        article: results.article,
      });
    }
  );
};

// Handle article update on POST.
exports.article_update_post = [
  // Convert the category to an array
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate fields.
  body("title", "Article title required").trim().isLength({ min: 1 }),
  body("text", "Text required").trim().isLength({ min: 1 }),
  body("category").trim().optional(),

  // Sanitize fields(no wildcard used, it seems to affect genre array)
  body("title").escape(),
  body("text").escape(),
  body("category").escape(),
  body("title").unescape(), //not sure if it is safe to do so
  body("text").unescape(), //not sure if it is safe to do so
  body("category").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    console.log(req.params.id);
    // Create a category object with escaped and trimmed data.
    var article = new Article({
      title: req.body.title,
      text: req.body.text,
      category: req.body.category,
      createdBy: req.user,
      updatedBy: req.user,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get article, categories for form.
      async.parallel(
        {
          article: (callback) => {
            Article.findById(req.params.id)
              .populate("createdBy")
              .populate("category")
              .exec(callback);
          },
          categories: (callback) => {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked.
          for (
            var all_c_iter = 0;
            all_c_iter < results.categories.length;
            all_c_iter++
          ) {
            for (
              var article_c_iter = 0;
              article_c_iter < results.article.category.length;
              article_c_iter++
            ) {
              if (
                results.categories[all_c_iter]._id.toString() ==
                results.article.category[article_c_iter]._id.toString()
              ) {
                results.categories[all_c_iter].checked = "true";
              }
            }
          }
          res.render("article_form", {
            title: "Update Article",
            categories: results.categories,
            article: article,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Article.findByIdAndUpdate(
        req.params.id,
        article,
        {},
        (err, thearticle) => {
          if (err) {
            return next(err);
          }
          // Successful - redirect to article detail page.
          res.redirect(thearticle.url);
        }
      );
    }
  },
];

// Display detail page for a specific Article.
exports.article_detail = function (req, res, next) {
  async.parallel(
    {
      article: function (callback) {
        Article.findById(req.params.id).populate("createdBy").exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("article_detail", {
        article: results.article,
      });
    }
  );
};
