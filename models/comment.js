var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for book's URL
CommentSchema.virtual("url").get(function () {
  return "/comment/" + this._id;
});

//Export model
module.exports = mongoose.model("Comment", CommentSchema);
