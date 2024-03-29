var mongoose = require("mongoose");

//Token Schema
var Schema = mongoose.Schema;

const TokenSchema = new Schema({
  _userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 },
});

//Export model
module.exports = mongoose.model("Token", TokenSchema);
