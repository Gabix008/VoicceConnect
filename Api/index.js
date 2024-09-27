//Importações
const express = require('express');
const multer = require('multer');
const app = express();
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const fs = require('fs');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const ElevenLabs = require("elevenlabs-node");
const deepl = require('deepl-node');
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config()// Carrega as variáveis de ambiente do arquivo .env

const translateRoutes = require('./Routes/translateRoutes')
// Cria um autenticador para os serviços do IBM Watson
const authenticator = new IamAuthenticator({ apikey: process.env.API_KEY_IBM });

app.use(express.json())

// Configura o middleware CORS para permitir requisições de um determinado domínio
app.use(cors({
  credentials: true,
  origin: process.env.ORIGIN
}))
app.use(express.static('public'))
// Middleware para interpretar requisições URL-encoded
app.use(
  express.urlencoded({
    extended: true
  })
)
// Usa as rotas de tradução que foram importadas
app.use('/', translateRoutes.translateRoutes)

app.listen(5000);