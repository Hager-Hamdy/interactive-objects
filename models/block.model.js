mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var blockSchema = new mongoose.Schema(
  {

    _id: mongoose.Schema.Types.ObjectId,
    pageId: { type: String },
    contentType: { type: String },
    contentValue: { type: String },
    coordinates: { type: Object }
  },
  {
    collection: "BookPages",
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

  blockSchema.plugin(mongoosePaginate);

module.exports = {
  blockSchema: mongoose.model("blockSchema", blockSchema),
};
