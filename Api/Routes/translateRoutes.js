// Importações
const express = require('express');
const TranslateController = require("../Controller/TranslateController");
const translateRoutes = express.Router();

// Define uma rota POST que aciona o método 'recognize' do TranslateController
translateRoutes.post("/recognize", TranslateController.recognize)
// Exporta o objeto 'translateRoutes'
module.exports = { translateRoutes };