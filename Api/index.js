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
require('dotenv').config()
const translateRoutes = require('./Routes/translateRoutes')

const authenticator = new IamAuthenticator({ apikey: process.env.API_KEY_IBM });
app.use(express.json())

// Solve CORS
app.use(cors({
  credentials: true,
  origin: process.env.ORIGIN
}))
app.use(express.static('public'))

app.use(
  express.urlencoded({
    extended: true
  })
)
app.use('/', translateRoutes.translateRoutes)

app.listen(5000);