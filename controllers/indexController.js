var Article = require("../models/article");
var Category = require("../models/category");
var Comment = require("../models/comment");
var User = require("../models/user");
var async = require("async");
const { body, validationResult } = require("express-validator");

// Display main page.
exports.main_page = function (req, res, next) {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  async.parallel(
    {
      article_last: (callback) => {
        // Show it only if it's verified or created by the logged user
        Article.find({ $or: [{ isVerified: true }, { createdBy: req.user }] })
          .skip((page - 1) * pagination)
          .limit(pagination)
          .populate("article")
          .populate("category")
          .populate("createdBy")
          .sort([["createdAt", "descending"]])
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
      res.render("index", {
        title: "Main Page",
        page: page,
        pagination: pagination,
        article_last: results.article_last,
        article_count: results.article_count,
      });
    }
  );
};
