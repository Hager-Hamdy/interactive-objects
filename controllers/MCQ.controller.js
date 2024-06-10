require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let interactiveObjectSchema = require("../models/interactive-object.model").interactiveObjectSchema;
const fs = require("fs")
const path = require("path")

router.get("/objectLabelsMCQ", async (req, res) => {
    res.status(200).json(
        [
            { question: "text" },
            { optionText: "text" },
            { chosenFeedback: "text" },
            { notChosenFeedback: "text" },
            { tip: "text" },
            { correct: "text" },
        ]
    )
});


router.post("/saveObjectMCQ/:id", async (req, res) => {
    const id = req.params.id
    const { objectElements } = req.body
    const newObj = {}
    
    newObj.type = "MCQ"
    const parameters = { _question_: "", answers: [] }
    for (let item of objectElements) {
        let key = Object.keys(item)[0]

        if (key === "_question_") {
            parameters['_question_'] = item[key]
        } else if (key === "_option_") {
            parameters.answers.push({ _option_: item[key], correct: false })
        } else if (key === "_chosenFeedback_") {
            parameters.answers[parameters.answers.length - 1]["_chosenFeedback_"] = item[key]
        } else if (key === "_notChosenFeedback_") {
            parameters.answers[parameters.answers.length - 1]["_notChosenFeedback_"] = item[key]
        } else if (key === "_tip_") {
            parameters.answers[parameters.answers.length - 1]["_tip_"] = item[key]
        } else if (key === "correct") {
            parameters.answers[parameters.answers.length - 1]["correct"] = item[key]
            newObj.isAnswered = 'g'
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
