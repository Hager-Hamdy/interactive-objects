mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var bookPageSchema = new mongoose.Schema(
  {

    _id: mongoose.Schema.Types.ObjectId,
    scubeId: { type: String },
    bookName: { type: String },
    chapterName: { type: String },
    url: { type: String },
    blocks: [
      {
        blockId: { type: String },
        contentType: { type: String },
        contentValue: { type: String },
        coordinates: { type: Object }
      }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "InteractiveObject",
    versionKey: false,
  }
);

bookPageSchema
  .virtual("pageId")
  .get(function () {
    return this._id.toString();
  })
  .set(function (x) {
    this._id = x;
  });

bookPageSchema.plugin(mongoosePaginate);

module.exports = {
  bookPageSchema: mongoose.model("bookPageSchema", bookPageSchema),
};
