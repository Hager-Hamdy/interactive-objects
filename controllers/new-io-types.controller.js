require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let IOTypeSchema =
  require("../models/new-object-types.model").IOTypeSchema;

router.get("/io-types", async (req, res) => {
  const typeNames = await IOTypeSchema.find(
    req.query, {}
  ).sort({ updatedAt: 'desc' });
  res.status(200).json(typeNames);
});

router.get("/io-types/:id", async (req, res) => {
  let obj = await IOTypeSchema.findById(req.params.id);
  res.status(200).json(obj);
});

router.post("/io-types", async (req, res) => {
  const existingType = await IOTypeSchema.find({ typeName: req.body.typeName });
  if (existingType.length) return res.status(422).json("This type is already exist.")
  newObj = new IOTypeSchema({ _id: false });
  newObj.id = new mongoose.Types.ObjectId();

  for (let key in req.body) {
    if (Object.hasOwnProperty.bind(req.body)(key)) {
      if (
        ["labels", "abstractParameter"].includes(key) &&
        typeof req.body[key] === "string"
      )
        newObj[key] = JSON.parse(req.body[key]);
      else newObj[key] = req.body[key];
    }
  }
  newObj.save((err, doc) => {
    if (!err) {
      res.status(201).json(newObj);
    } else {
      console.log(err);
      res.status(406).json(`Not Acceptable: ${err}`);
    }
  });
});

router.patch("/io-types/:id", (req, res) => {
  const id = req.params.id;
  const obj = { _id: id };
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      if (
        ["labels", "abstractParameter"].includes(key) &&
        typeof req.body[key] === "string"
      ) obj[key] = JSON.parse(req.body[key]);
      else obj[key] = req.body[key];
    }
  }

  obj.updatedAt = new Date().toISOString();
  IOTypeSchema.updateOne(
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

router.delete("/io-types/:id", async (req, res) => {
  IOTypeSchema.findByIdAndRemove(req.params.id)
    .then((doc) => {
      res.status(200).json("Type deleted successfully.");
    })
    .catch((err) => {
      res.status(500).json(`Can't delete type: ${err}`);
    });
});
module.exports = router;
