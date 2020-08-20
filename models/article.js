var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    comment: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for article's URL
ArticleSchema.virtual("url").get(function () {
  return "/articles/" + this._id;
});

//Export model
module.exports = mongoose.model("Article", ArticleSchema);
