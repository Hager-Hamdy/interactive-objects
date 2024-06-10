require("dotenv").config()
const express = require("express")
let bookSchema = require("../models/book.model").bookSchema
let mongoose = require("mongoose")
let router = express.Router()

router.get("/books", async (req, res) => {
  req.query.isDeleted = false

  const page = req.query.page || 1
  const limit = req.query.limit || 10

  delete req.query.page
  delete req.query.limit

  const data = await bookSchema.paginate(req.query, {
    page,
    limit,
    sort: { updatedAt: "desc" },
  })

  res.json(data)
})
router.get("/books/:id", async (req, res) => {
  let book = await bookSchema.findById(req.params.id)
  if (book) res.status(200).json(book)
  else res.status(404).json("Can't find book with this ID.")
})
router.post("/books", async (req, res) => {
  const bookObject = new bookSchema({ _id: false })
  bookObject.courseId = new mongoose.Types.ObjectId()

  bookObject.version = 1

  for (let key in req.body) {
    if (Object.hasOwnProperty.bind(req.body)(key)) {
      if (["bookObjects", "lessons"].includes(key)) bookObject[key] = JSON.parse(req.body[key])
      else bookObject[key] = req.body[key]
    }
  }
  bookObject.save((err, doc) => {
    if (!err) {
      res.status(200).json(bookObject.smartCourseId)
    } else {
      console.log(err)
      res.status(406).json("Not Acceptable")
    }
  })
})


router.patch("/books/:bookId", (req, res) => {
  const id = req.params.bookId
  const book = { _id: id }
  for (let key in req.body) {
    if (req.body[key]) {
      if (["bookObjects", "lessons"]) book[key] = JSON.parse(req.body[key])
      else book[key] = req.body[key]
    }
  }

  book.updatedAt = Date.now()
  bookSchema.updateOne(
    { _id: id },
    {
      $set: book,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(doc)
      } else {
        res.status(500).json(err)
      }
    }
  )
})

router.delete("/books/:bookId", async (req, res) => {
  bookSchema
    .findByIdAndRemove(req.params.bookId)
    .then((doc) => {
      res.status(200).json({ message: "Course deleted successfully.", data: doc })
    })
    .catch((err) => {
      res.status(500).json("Can't delete book: " + err)
    })
})

module.exports = router
