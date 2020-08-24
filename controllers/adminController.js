var Article = require("../models/article");
var Category = require("../models/category");
var Comment = require("../models/comment");
var async = require("async");

// Display Dashboard on GET.
exports.admin_dashboard_get = (req, res, next) => {
  async.parallel(
    {
      // All items from DB
      article_count: (callback) => {
        Article.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      category_count: (callback) => {
        Category.countDocuments({}, callback);
      },
      comment_count: (callback) => {
        Comment.countDocuments({}, callback);
      },
      // All approved items
      article_count_approved: (callback) => {
        Article.countDocuments({ isVerified: true }, callback);
      },
      category_count_approved: (callback) => {
        Category.countDocuments({ isVerified: true }, callback);
      },
      comment_count_approved: (callback) => {
        Comment.countDocuments({ isVerified: true }, callback);
      },
      // All pending items
      article_count_pending: (callback) => {
        Article.countDocuments({ isVerified: false }, callback);
      },
      category_count_pending: (callback) => {
        Category.countDocuments({ isVerified: false }, callback);
      },
      comment_count_pending: (callback) => {
        Comment.countDocuments({ isVerified: false }, callback);
      },
    },
    (err, results) => {
      res.render("admin_dashboard", {
        title: "Dashboard",
        error: err,
        data: results,
      });
    }
  );
};

// Display Pending Articles on GET.
exports.admin_articles_get = (req, res, next) => {
  async.parallel(
    {
      articles: (callback) => {
        Article.find(
          // Show the item only if it's not approved by admin
          { isVerified: false },
          "title createdBy createdAt"
        )
          .sort("title")
          .populate("createdBy")
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_articles", {
        title: "Pending Articles",
        error: err,
        articles: results.articles,
      });
    }
  );
};

// Handle Approving Articles on POST
exports.admin_articles_post = (req, res, next) => {
  async.parallel(
    {
      article: (callback) => {
        Article.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.articleId }
        ).exec(callback);
      },
    },
    (err, article) => {
      if (err) {
        return next(err);
      }

      article.article.isVerified = true;

      article.article.markModified("isVerified");
      article.article.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The article has been successfully approved.");
        res.redirect("/dashboard/articles");
        return;
      });
    }
  );
};

// Display Pending Categories on GET.
exports.admin_categories_get = (req, res, next) => {
  async.parallel(
    {
      categories: (callback) => {
        Category.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .sort([["name", "ascending"]])
          .populate("createdBy")
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_categories", {
        title: "Pending Categories",
        error: err,
        categories: results.categories,
      });
    }
  );
};

// Handle Approving Categories on POST
exports.admin_categories_post = (req, res, next) => {
  async.parallel(
    {
      category: (callback) => {
        Category.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.categoryId }
        ).exec(callback);
      },
    },
    (err, category) => {
      if (err) {
        return next(err);
      }

      category.category.isVerified = true;

      category.category.markModified("isVerified");
      category.category.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The category has been successfully approved.");
        res.redirect("/dashboard/categories");
        return;
      });
    }
  );
};

// Display Pending Comments on GET.
exports.admin_comments_get = (req, res, next) => {
  async.parallel(
    {
      comments: (callback) => {
        Comment.find(
          // Show the item only if it's not approved by admin
          { isVerified: false }
        )
          .populate("comment")
          .sort([["title", "ascending"]])
          .exec(callback);
      },
    },
    (err, results) => {
      res.render("admin_comments", {
        title: "Pending Comments",
        error: err,
        comments: results.comments,
      });
    }
  );
};

// Handle Approving comments on POST
exports.admin_comments_post = (req, res, next) => {
  async.parallel(
    {
      comment: (callback) => {
        Comment.findOne(
          // Show the item only if it's not approved by admin
          { isVerified: false, _id: req.body.commentId }
        ).exec(callback);
      },
    },
    (err, comment) => {
      if (err) {
        return next(err);
      }

      comment.comment.isVerified = true;

      comment.comment.markModified("isVerified");
      comment.comment.save((err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "The comment has been successfully approved.");
        res.redirect("/dashboard/comments");
        return;
      });
    }
  );
};
