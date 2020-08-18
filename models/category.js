var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: { type: String, required: true, min: 3, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Virtual for genre's URL
CategorySchema.virtual("url").get(function () {
  return "/categories/" + this._id;
});

//Export model
module.exports = mongoose.model("Category", CategorySchema);
