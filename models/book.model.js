mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const languages = Object.freeze({
  English: "en",
  Arabic: "ar",
  French: "fr",
  Spanish: "es",
  Italian: "it",
  Deutsch: "de",
})

const bookSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String },
    domainId: { type: String },
    subDomainId: { type: String },
    language: {
      type: String,
      enum: Object.values(languages),
    },
    objectives: { type: String },
    description: { type: String },
    ownershipId: { type: String },
    lessons: [],
    bookObjects: [],
    version: { type: Number, default: 1 },
    grade: { type: Number, default: 1 },
    owner: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    fromId: {
      type: String,
    },
    domainName: {
      type: String,
    },
    subDomainName: {
      type: String,
    },
    cover: { type: String },
    type: { type: String, default: 'book' },
  },
  {
    collection: "book",
    versionKey: false,
  }
)

bookSchema
  .virtual("bookId")
  .get(function () {
    return this._id.toString()
  })
  .set(function (x) {
    this._id = x
  })
bookSchema.plugin(mongoosePaginate)

module.exports = {
  bookSchema: mongoose.model("book", bookSchema),
}
