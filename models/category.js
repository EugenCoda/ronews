var mongoose = require("mongoose");
var slug = require("mongoose-slug-generator");
mongoose.plugin(slug);

var Schema = mongoose.Schema;

var CategorySchema = new Schema(
  {
    name: { type: String, required: true, min: 3, max: 100 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isVerified: { type: Boolean, default: false },
    slug: { type: String, slug: "name", unique: true },
  },
  {
    timestamps: true,
  }
);

// Virtual for genre's URL
CategorySchema.virtual("url").get(function () {
  return "/categories/" + this._id + "/" + this.slug;
});

//Export model
module.exports = mongoose.model("Category", CategorySchema);
