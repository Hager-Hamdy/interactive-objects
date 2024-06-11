mongoose = require("mongoose");

var IOTypeSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    typeName: { type: String, required: "This field is required.", unique: true },
    category: {
      type: String,
      enum: ["Q", "X", "SI", "B", "G"],
    },
    labels: [{ type: Object }],
    repeatedString: { type: String },
    repeated2: { type: String },
    repeated3: { type: String },
    htmlSeparator: { type: String },
    abstractParameter: { type: Object },
    templateId: { type: String },
    templateName: { type: String },
    templateUrl: { type: String },
    exampleId: { type: String },
    originalJson: { type: String },
    modifiedJson: { type: String },
  },
  {
    collection: "InteractiveTypes",
    versionKey: false,
  }
);

IOTypeSchema
  .virtual("id")
  .get(function () {
    return this._id.toString();
  })
  .set(function (x) {
    this._id = x;
  });


module.exports = {
  IOTypeSchema: mongoose.model("IOTypeSchema", IOTypeSchema),
};
