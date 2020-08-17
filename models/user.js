mongoose = require("mongoose");

//User Schema
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    name: { type: String, required: true, max: 100 },
    email: { type: String, required: true, max: 100 },
    username: { type: String, required: true, max: 100 },
    isVerified: { type: Boolean, default: false },
    password: { type: String, required: true, max: 100 },
  },
  {
    timestamps: true,
  }
);

//Export model
module.exports = mongoose.model("User", UserSchema);
