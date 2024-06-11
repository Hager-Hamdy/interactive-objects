mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const languages = Object.freeze({
  English: "en",
  Arabic: "ar",
  French: "fr",
  Spanish: "es",
  Italian: "it",
  Deutsch: "de",
});

var interactiveObjectSchema = new mongoose.Schema(
  {
    
    _id: mongoose.Schema.Types.ObjectId,
    owner: { type: String, default: 'public' },
    objectOwner: { type: String, default: 'public' },
    questionName: { type: String, required: "this field is required." },
    language: {
      type: String,
      enum: Object.values(languages),
    },
    domainId: { type: String },
    subDomainId: { type: String },
    domainName: {
      type: String,
    },
    subDomainName: {
      type: String,
    },
    conceptId: { type: String },
    conceptName: {
      type: String,
    },
    type: {
      type: String,
    },
    topic: {
      type: String,
    },
    url: {
      type: String,
    },
    isAnswered: {
      type: String,
      enum: ["g", "y", "r"],
      default: "r",
    },
    parameters: {
      type: Object,
    },
    h5pString: {
      type: Object
    },
    questionOrExplanation: {
      type: String,
      enum: ["Q", "X", "SI", "B", "G"],
    },
    blockCoordinates: { type: Object },
    objectElements: [{ type: Object }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    collection: "InteractiveObjects",
    versionKey: false,
  }
);

interactiveObjectSchema
  .virtual("objId")
  .get(function () {
    return this._id.toString();
  })
  .set(function (x) {
    this._id = x;
  });

interactiveObjectSchema.plugin(mongoosePaginate);

module.exports = {
  interactiveObjectSchema: mongoose.model("interactiveObjectSchema", interactiveObjectSchema),
};
