var Category = require("../models/category");
var Article = require("../models/article");
var async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Categories.
exports.category_list = function (req, res, next) {
  // Show it only if it's verified or created by the logged user
  Category.find({ $or: [{ isVerified: true }, { createdBy: req.user }] })
    .populate("category")
    .sort([["name", "ascending"]])
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("category_list", {
        title: "Categories",
        category_list: list_categories,
      });
    });
};

// Display detail page for a specific Category.
exports.category_detail = function (req, res, next) {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },

      category_articles: function (callback) {
        // Show it only if it's from this category AND verified or created by the logged user
        Article.find({
          $and: [
            { $or: [{ isVerified: true }, { createdBy: req.user }] },
            { category: req.params.id },
          ],
        })
          .skip((page - 1) * pagination)
          .limit(pagination)
          .sort("title")
          .populate("createdBy")
          .populate("category")
          .exec(callback);
      },
      category_article_count: (callback) => {
        Article.countDocuments({ category: req.params.id }, callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        var err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }

      if (!results.category.isVerified) {
        // An user is logged in
        if (req.user) {
          if (
            results.category.createdBy.toString() != req.user._id.toString()
          ) {
            // Category is not approved by admin and it was not added by the logged user.
            req.flash("danger", "You are not authorized to view this page.");
            res.redirect("/");
            return;
          }
          // No user logged in
        } else {
          {
            // Category is not approved by admin
            req.flash("danger", "You are not authorized to view this page.");
            res.redirect("/");
            return;
          }
        }
      }

      // Successful, so render
      res.render("category_detail", {
        title: "RR | " + results.category.name,
        page: page,
        pagination: pagination,
        category: results.category,
        category_articles: results.category_articles,
        category_article_count: results.category_article_count,
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = function (req, res, next) {
  res.render("category_form", { title: "Add Category" });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate that the name field is not empty.
  body("name", "Category name required").trim().isLength({ min: 1 }),

  // Sanitize (escape) the name field.
  body("name").escape(),
  body("name").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    var category = new Category({
      name: req.body.name,
      createdBy: req.user,
      updatedBy: req.user,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Add Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Category with same name already exists.
      Category.findOne({ name: req.body.name }).exec(function (
        err,
        found_category
      ) {
        if (err) {
          return next(err);
        }

        if (found_category) {
          // Category exists, redirect to its detail page.
          res.redirect(found_category.url);
        } else {
          category.save(function (err) {
            if (err) {
              return next(err);
            }
            // Category saved. Redirect to category detail page.
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

// Display Category delete form on GET.
exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      categories_articles: function (callback) {
        Article.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        category_articles: results.categories_articles,
      });
    }
  );
};

// Handle Category delete on POST.
exports.category_delete_post = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      categories_articles: function (callback) {
        Article.find({ category: req.body.categoryid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.categories_articles.length > 0) {
        // Category has articles. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete Category",
          category: results.category,
          category_articles: results.categories_articles,
        });
        return;
      } else {
        // Category has no articles. Delete object and redirect to the list of categories.
        Category.findByIdAndRemove(req.body.categoryid, function deleteCategory(
          err
        ) {
          if (err) {
            return next(err);
          }
          // Success - go to category list
          res.redirect("/categories");
        });
      }
    }
  );
};

// Display Category update form on GET.
exports.category_update_get = function (req, res, next) {
  Category.findById(req.params.id, function (err, category) {
    if (err) {
      return next(err);
    }
    if (category == null) {
      // No results.
      var err = new Error("Category not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("category_form", {
      title: "Update Category",
      category: category,
    });
  });
};

// Handle Category update on POST.
exports.category_update_post = [
  // Validate that the name field is not empty.
  body("name", "Category name required").isLength({ min: 1 }).trim(),

  // Sanitize (escape) the name field.
  body("name").escape(),
  body("name").unescape(), //not sure if it is safe to do so

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data (and the old id!)
    var category = new Category({
      name: req.body.name,
      updatedBy: req.user,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Category.findByIdAndUpdate(req.params.id, category, {}, function (
        err,
        thecategory
      ) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to category detail page.
        res.redirect(thecategory.url);
      });
    }
  },
];
