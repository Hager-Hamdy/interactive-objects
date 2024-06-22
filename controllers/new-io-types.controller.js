require("dotenv").config();
const express = require("express");
let router = express.Router();
let IOTypeSchema =
  require("../models/object-types.model").IOTypeSchema;
const fs = require("fs")
const request = require("request")

router.get("/test/:id", async (req, res) => {
  let item = await IOTypeSchema.findById(req.params.id);
  if (item.templateUrl){
    res.send("okk")
     return
  }
  const decodedTempalteId = JSON.parse(atob(item.templateId));
  let templateUrl
  let url
  await request.get("http://34.246.140.123:4000/api/los/" + decodedTempalteId.id, async function (error, response, body) {
    url = JSON.parse(body).url
    await request.get("http://34.246.140.123:4000/api/signedurl?url=" + url, function (error, response, body2) {
      templateUrl = JSON.parse(body2).LOPreSignedURL
      request.get(templateUrl, function (error, response, body3) {
        fs.writeFileSync(`./templates/${url.split("/").pop()}`, body3)
        item.templateUrl = `https://lom-dev.eduedges.com/templates/${url.split("/").pop()}`
        IOTypeSchema.updateOne(
          { _id: req.params.id },
          {
            $set: item,
          },
          { new: false, runValidators: true, returnNewDocument: true, upsert: true },
          (err, doc) => {
          }
        );
      })
      res.send("ok")
    })
  })
})


router.get("/interactive-object-types", async (req, res) => {
  const types = await IOTypeSchema.find(
    {
    
    }, {
    typeName: 1, labels: 1, _id: 1
  }
  )
  const bookLabels = [
    {
      typeName: "Simple item",
      typeCategory: "B",
      labels: [{ Objective: "text" }, { Paragraph: "text" }, { Picture: "image" }, { Voice: "audio" }, { Video: "video" }]
    },
    {
      typeName: "Interactive object",
      typeCategory: "B",
      labels: [{ BarChart: "Chart" }, { PieChart: "Chart" }, { NumericTable: "Chart" }, { Analytics: "Chart" },
      { Classification: "ImageSlider" }, { DifferentCases: "ImageSlider" }, { Phases: "Agamotto" },
      { Cycles: "Agamotto" }, { Lifecycles: "Agamotto" }, { ChemicalReaction: "Agamotto" },
      { ChemicalEquation: "Agamotto" }, { BeforeAndAfter: "Juxtaposition" }, { TwoEvents: "Juxtaposition" },
      { TwoStepExperiment: "Juxtaposition" }, { DialogCards: "Dialog Cards" }, { FlashCards: "Flash Cards" },
      { HotspotImage: "Hotspot Image" }, { InteractiveVideo: "Interactive Video" }, { Accordion: "Accordion" },
      { GuessAnswer: "Guess Answer" }, { Chart: "Chart" }, { ImageJuxtaposition: "Image Juxtaposition" },
      { ImageSlider: "Image Slider" }, { ImageBlinder: "Agamotto" }]
    },
    {
      typeName: "Question",
      typeCategory: "B",
      labels: [{ GuessTheImage: "Guess Answer" }, { WhatHappensWhen: "Guess Answer" }, { HowItMightHappen: "Guess Answer" },
      { WhyItHappens: "Guess Answer" }, { Justify: "Guess Answer" }, { TrueFalse: "TrueFalse" }, { TextMCQ: "Text MCQ" },
      { FillTheBlanks: "Fill The Blanks" }, { TextDragWords: "Text Drag Words" }, { Dictation: "Dictation" },
      { MarkTheWords: "Mark The Words" }, { ImageHotspotQuestion: "Image Hotspot Question" },
      { ImageMultipleHotspotQuestion: "Image Multiple Hotspot Question" }, { SpeakTheWords: "Speak the words" },
      { ImageMCQ: "Image MCQ" }, { Essay: "Essay" }, { SortParagraphs: "Sort Paragraphs" }, { SortImages: "Sort Images" }]
    },
    {
      typeName: "TOC",
      typeCategory: "B",
      labels: [{ TOC_Level1: "text" }, { TOC_Level2: "text" }, { TOC_Level3: "text" },
      { Section: "text" }, { SubSection: "text" }, { SubSubSection: "text" }, { SideHeader: "text" }]
    },
    {
      typeName: "Keyword",
      typeCategory: "B",
      labels: [{ KeywordText: "text" }, { KeywordDefinition: "text" }, { KeywordIllustration: "image" }, { KeywordExplanation: "text" },
      { Acronym: "text" }]
    },
    {
      typeName: "SI",
      typeCategory: "B",
      labels: [
        { Paragraph: "text" }, { Picture: "image" }, { DialogCards: "Dialog Cards" },
        { FlashCards: "Flash Cards" },
        { HotspotImage: "Hotspot Image" },
        { InteractiveVideo: "Interactive Video" },
        { Accordion: "Accordion" },
        { GuessAnswer: "Guess Answer" },
        { Chart: "Chart" },
        { ImageJuxtaposition: "Image Juxtaposition" },
        { ImageSlider: "Image Slider" },
        { ImageBlinder: "Agamotto" }
      ]
    },
    ...types
    // {
    //   typeName: "Text MCQ",
    //   typeCategory: "Q",
    //   labels: [
    //     {
    //       "*_Question_": "text"
    //     },
    //     {
    //       "*_OptionText_": "text"
    //     },
    //     {
    //       "_ChosenFeedback_": "text"
    //     },
    //     {
    //       "_notChosenFeedback_": "text"
    //     },
    //     {
    //       "_Tip_": "text"
    //     },
    //     {
    //       "#_Correct_": "Bool"
    //     }
    //   ]
    // },

  ]
  // const typeNames = await IOTypeSchema.find(
  //   req.query, {}
  // ).sort({ updatedAt: 'desc' });
  res.status(200).json(bookLabels);
});

router.get("/interactive-object-types/:id", async (req, res) => {
  let obj = await IOTypeSchema.findById(req.params.id);
  res.status(200).json(obj);
});

router.get("/interactive-object-types/:id", async (req, res) => {
  let obj = await IOTypeSchema.findById(req.params.id);
  res.status(200).json(obj);
});

router.get("/interactive-object-types/find-by-name", async (req, res) => {
  const typeNames = await IOTypeSchema.find(
    req.query
  )
  res.status(200).json(typeNames[0]);
});

router.post("/interactive-object-types", async (req, res) => {
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


router.patch("/interactive-object-types/:id", (req, res) => {
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


module.exports = router;
