mongoose = require("mongoose");

var blockSchema = new mongoose.Schema(
  {

    _id: mongoose.Schema.Types.ObjectId,
    pageId: { type: String },
    contentType: { type: String },
    contentValue: { type: String },
    coordinates: { type: Object }
  },
  {
    collection: "Blocks",
    versionKey: false,
  }
);

blockSchema
  .virtual("blockId")
  .get(function () {
    return this._id.toString();
  })
  .set(function (x) {
    this._id = x;
  });


module.exports = {
  blockSchema: mongoose.model("blockSchema", blockSchema),
};
