require("dotenv").config();
const express = require("express");
let router = express.Router();
let IOTypeSchema =
  require("../models/object-types.model").IOTypeSchema;

router.get("/interactive-object-types", async (req, res) => {
  const bookLabels = [
    {
      typeName: "Simple item",
      labels: [{ Objective: "text" }, { Paragraph: "text" }, { Picture: "image" }, { Voice: "audio" }, { Video: "video" }]
    },
    {
      typeName: "Interactive object",
      labels: [{ BarChart: "Chart" }, { PieChart: "Chart" }, { NumericTable: "Chart"}, { Analytics: "Chart" },
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
      labels: [{ GuessTheImage: "Guess Answer" }, { WhatHappensWhen: "Guess Answer" }, { HowItMightHappen: "Guess Answer" },
      { WhyItHappens: "Guess Answer" }, { Justify: "Guess Answer" }, { TrueFalse: "TrueFalse" }, { TextMCQ: "Text MCQ" },
      { FillTheBlanks: "Fill The Blanks" }, { TextDragWords: "Text Drag Words" }, { Dictation: "Dictation" },
      { MarkTheWords: "Mark The Words" }, { ImageHotspotQuestion: "Image Hotspot Question" },
      { ImageMultipleHotspotQuestion: "Image Multiple Hotspot Question" }, { SpeakTheWords: "Speak the words" },
      { ImageMCQ: "Image MCQ" }, { Essay: "Essay" }, { SortParagraphs: "Sort Paragraphs" }, { SortImages: "Sort Images" }]
    },
    {
      typeName: "TOC",
      labels: [{ TOC_Level1: "text" }, { TOC_Level2: "text" }, { TOC_Level3: "text" },
      { Section: "text" }, { SubSection: "text" }, { SubSubSection: "text" }, { SideHeader: "text" }]
    },
    {
      typeName: "Keyword",
      labels: [{ KeywordText: "text" }, { KeywordDefinition: "text" }, { KeywordIllustration: "image" }, { KeywordExplanation: "text" },
      { Acronym: "text" }]
    },
    {
      typeName: "SI",
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
    }
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

module.exports = router;
