require("dotenv").config();
const express = require("express");
let router = express.Router();
let bookPageSchema =
  require("../models/book-pages.model").bookPageSchema;

router.get("/book-pages", async (req, res) => {
  let pages = await bookPageSchema.find(req.query);
  res.status(200).json(pages);
});

router.get("/book-pages/:id", async (req, res) => {
  let obj = await bookPageSchema.findById(req.params.id);
  res.status(200).json(obj);
});

router.post("/book-pages", async (req, res) => {
  const newObj = new bookPageSchema({ _id: false });
  newObj.pageId = new mongoose.Types.ObjectId();

  for (let key in req.body) {
    if (Object.hasOwnProperty.bind(req.body)(key)) {
      if (key === "blocks" && typeof req.body[key] === "string")
        newObj[key] = JSON.parse(req.body[key]);
      else newObj[key] = req.body[key];
    }
  }
  newObj.save(async (err, doc) => {
    if (!err) {
      if (req.body.objectElements) {
        
          bookPageSchema.updateOne(
            { _id: doc._id },
            {
              $set: doc,
            },
            { new: false, runValidators: true, returnNewDocument: true, upsert: true },
            (err, doc) => {
              if (err) console.log(err)
            }
          );
      }
      res.status(200).json(newObj.pageId);
    } else {
      console.log(err);
      res.status(406).json(`Not Acceptable: ${err}`);
    }
  });
});

router.patch("/book-pages/:id", (req, res) => {
  const id = req.params.id;
  const obj = { _id: id };
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      if (key === "blocks" && typeof req.body[key] === "string")
        obj[key] = JSON.parse(req.body[key]);
      else obj[key] = req.body[key];
    }
  }

  obj.updatedAt = Date.now();
  bookPageSchema.updateOne(
    { _id: id },
    {
      $set: obj,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(obj);
      } else {
        res.status(500).json(err);
      }
    }
  );
});

module.exports = router;
