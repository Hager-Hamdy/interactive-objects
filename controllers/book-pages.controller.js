require("dotenv").config();
const express = require("express");
let router = express.Router();
let bookPageSchema =
  require("../models/book-pages.model").bookPageSchema;
let blockSchema = require("../models/block.model").blockSchema;
router.get("/upload-chapter", async (req, res) => {
  let pages = await bookPageSchema.find(req.query, { _id: 1, url: 1, blocks: 1 });
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

router.post("/save-blocks", async (req, res) => {
  try {
    const { blocks } = req.body
    for await (let element of blocks) {
      const { pageId, contentType, contentValue, coordinates } = element

      const newBlock = new blockSchema({ _id: false });
      newBlock.blockId = new mongoose.Types.ObjectId();
      newBlock.pageId = pageId
      newBlock.coordinates = coordinates
      newBlock.contentType = contentType
      newBlock.contentValue = contentValue
      newBlock.save();
      const page = await bookPageSchema.findById(pageId);

      const newBlocks = [...page.blocks, {
        blockId: newBlock.blockId,
        coordinates,
        contentType,
        contentValue
      }]

      page.blocks = newBlocks
      await bookPageSchema.updateOne(
        { _id: pageId },
        {
          $set: page,
        },
        { new: false, runValidators: true, returnNewDocument: true, upsert: true },
        (err, doc) => { }
      );

    }
    res.status(200).json("Blocks save successfully");
  } catch (err) {
    res.status(500).json(err);
  }

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

router.delete("/book-pages/:id", async (req, res) => {
  bookPageSchema
    .findByIdAndRemove(req.params.id)
    .then((doc) => {
      res.status(200).json("Page deleted successfully.");
    })
    .catch((err) => {
      res.status(500).json(`Can't delete object: ${err}`);
    });
});

module.exports = router;
