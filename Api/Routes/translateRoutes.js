const express = require('express');
const TranslateController = require("../Controller/TranslateController");

const translateRoutes = express.Router();

translateRoutes.post("/recognize", TranslateController.recognize)
module.exports = { translateRoutes };