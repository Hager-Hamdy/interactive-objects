require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let interactiveObjectSchema = require("../models/interactive-object.model").interactiveObjectSchema;
const fs = require("fs")
const path = require("path")
const { text, json } = require("body-parser")

router.get("/objectLabelsInteractivevideo", async (req, res) => {
  const Labels = [
    {
      "_Path_": "video"
    },
    {
      "_InteractionFrom_": "number"
    },
    {
      "_InteractionTo_": "number"
    },
    {
      "_InteractionLabel_": "text"
    },
    {
      "_InteractionText_": "text"
    },
    {
      "_InteractionPause_": "boolean"
    },
    {
      "_BookmarkTime_": "number"
    },
    {
      "_BookmarkLabel_": "text"
    },
    {
      "_EndscreenTime_": "number"
    },
    {
      "_EndscreenLabel_": "text"
    },
    {
      "_SummaryIntro_": "text"
    },
    {
      "_SummaryTip_": "text"
    },
    {
      "_SummaryText_": "text"
    }
  ];

  res.status(200).json(
    Labels,
  )
});


router.post("/saveObjectInterActiveVideo/:id", async (req, res) => {
  const id = req.params.id
  const { objectElements } = req.body
  const newObj = {}

  newObj.type = "InteractiveVideo"
  const parameters = { interactions: [] }
  for (let item of objectElements) {
    let key = Object.keys(item)[0]
    if (key === "_Path_")
      parameters[key] = item[key]
    else if (key === "_InteractionLabel_") {
      parameters.interactions.push({ _InteractionLabel_: item[key] })
    } else if (key === "_InteractionText_") {
      parameters.interactions[parameters.interactions.length - 1]["_InteractionText_"] = item[key]
    } else if (key === " _InteractionFrom_") {
      parameters.interactions[parameters.interactions.length - 1]["_InteractionFrom_"] = item[key]
    } else if (key === "_InteractionTo_") {
      parameters.interactions[parameters.interactions.length - 1]["_InteractionTo_"] = item[key]
    } else if (key === "_InteractionPause_") {
      parameters.interactions[parameters.interactions.length - 1]["_InteractionPause_"] = item[key]
    } else if (key === "_BookmarkLabel_") {
      parameters[key] = item[key]
    } else if (key === "_BookmarkTime_") {
      parameters[key] = item[key]
    } else if (key === "_SummaryIntro_") {
      parameters[key] = item[key]
    } else if (key === "_SummaryTip_") {
      parameters[key] = item[key]
    } else if (key === "_BookmarkText_") {
      parameters[key] = item[key]
    }
  }
  newObj.parameters = parameters
  interactiveObjectSchema.updateOne(
    { _id: id },
    {
      $set: newObj,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(newObj);
      } else {
        res.status(500).json(err);
      }
    }
  );
});

module.exports = router;
