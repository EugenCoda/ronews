var Article = require("../models/article");
var Category = require("../models/category");
var Comment = require("../models/comment");
var User = require("../models/user");
var async = require("async");
const { body, validationResult } = require("express-validator");
const fetch = require("node-fetch");
const convert = require("xml-js");
//const { response } = require("express"); - cum a ajuns asta aici?

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
        title: "Romanian Reporter",
        page: page,
        pagination: pagination,
        article_last: results.article_last,
        article_count: results.article_count,
      });
    }
  );
};

// Display exchange rate.
// Data is fetched from the BNR website as XML, then converted to JSON
exports.exchange_rate = function (req, res, next) {
  let dataAsJson = {};
  fetch("https://www.bnr.ro/nbrfxrates.xml")
    .then((response) => response.text())
    .then((str) => {
      dataAsJson = JSON.parse(convert.xml2json(str));
    })
    .then(() => {
      res.json(dataAsJson);
    })
    .catch((err) => console.error(err));
};

// Display search results on GET.
exports.search = (req, res, next) => {
  var search = req.query.search;

  if (search == "") {
    // Cannot perform the seach with empty string.
    req.flash("danger", "Please enter some text to perform a search.");
    res.redirect("/");
    return;
  }
  async.parallel(
    {
      articles: (callback) => {
        // For an unknown reason, I cannot create a text index in MongoDB Atlas for articles,
        // so I created an Atlas Search Index, which works with aggregate
        Article.aggregate([
          {
            $search: {
              text: {
                query: search,
                path: ["title", "text", "category"],
              },
            },
          },
          // Show the item only if it's approved by admin.
          // TODO: or if it was created by the logged user (didn't manage to make it work with aggregate)
          { $match: { isVerified: true } },
          {
            $limit: 5,
          },
          {
            $project: {
              _id: 1,
              title: 1,
              text: 1,
              category: 1,
              slug: 1,
            },
          },
        ]).exec(callback);
      },
      categories: (callback) => {
        // For an unknown reason, I cannot create a text index in MongoDB Atlas for categories,
        // so I created an Atlas Search Index, which works with aggregate
        Category.aggregate([
          {
            $search: {
              text: {
                query: search,
                path: ["name"],
              },
            },
          },
          // Show the item only if it's approved by admin.
          // TODO: or if it was created by the logged user (didn't manage to make it work with aggregate)
          { $match: { isVerified: true } },
          {
            $limit: 5,
          },
          {
            $project: {
              _id: 1,
              name: 1,
              slug: 1,
            },
          },
        ]).exec(callback);
      },
    },

    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render("search", {
        title: "RR | Search Results",
        articles: results.articles,
        categories: results.categories,
      });
    }
  );
};
