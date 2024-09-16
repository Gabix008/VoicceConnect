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

//const upload = multer({ dest: 'uploads/' });

//Credenciais Speech to text(IBM)
const apiKey = '6rr5TGgpnEqOB4bRxeMNp1JZn9_bzR0GJhXBw5KG6rF1'
const url = 'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/d55efdae-e29d-45cf-b729-fa2f3f38b8ca'

//credenciais translate 
const authKey = 'c15b640e-58ec-4f95-943d-ee60094fe650:fx';
const translator = new deepl.Translator(authKey);

//credenciais elevenLabs
const voice = new ElevenLabs(
  {
    apiKey: "sk_756975d75518d69e6a31809785d0afba3fb6df3c54e63d6c",
    voiceId: ""

  }
)


const authenticator = new IamAuthenticator({ apikey: apiKey });
app.use(express.json())

// Solve CORS
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173'
}))
app.use(express.static('public'))

app.use(
  express.urlencoded({
    extended: true
  })
)

app.post('/recognize', async (req, res) => {
  const storage = multer.diskStorage({

    destination: function (req, file, cb) {
      cb(null, `${__dirname}/media`);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + ".mp3");
    },
  })
  const upload = multer({ storage }).single("audio");

  await upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).send(err);
    } else if (err) {
      return res.status(500).send(err);
    }

    const audioFilePath = `${__dirname}/media/${req.file.filename}`;// Constrói o caminho completo do arquivo de áudio
    const convertedFilePath = `${__dirname}/media/${Date.now()}.wav`;

    ffmpeg(audioFilePath)
      .output(convertedFilePath)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => {
        const params = {
          audio: fs.createReadStream(convertedFilePath),
          contentType: 'audio/wav',
          endOfPhraseSilenceTime: 20,
          smartFormatting: true,
        }
        const speechToText = new SpeechToTextV1({
          authenticator: authenticator,
          serviceUrl: url,
        })
        const languageTranslator = new LanguageTranslatorV3({
          version: '2018-05-01',
          authenticator: new IamAuthenticator({
            apikey: '51nzSU6w3RA6eUCkvFaNjR6I8JcoufO99NljNzujLoVz',
          }),
          headers: {
            'X-Watson-Learning-Opt-Out': 'true'
          },
          serviceUrl: 'https://api.au-syd.language-translator.watson.cloud.ibm.com/instances/eb96f779-fff6-43b0-8e51-7ea40e468404',
        });
        speechToText.recognize(params)
          .then(response => {
            const translateParams = {
              text: response.result.results[0].alternatives[0].transcript,
              modelId: 'en-pt',
            };

            languageTranslator.translate(translateParams)
              .then(async (response) => {


                voice.textToSpeechStream({
                  fileName: "audio.mp3",
                  textInput: response.result.translations[0].translation,
                  voiceId: 'QJd9SLe6MVCdF6DR0EAu',
                  stability: 0.54,
                  similarityBoost: 0.36,
                  modelId: "eleven_multilingual_v2",
                  responseType: "stream",
                  speakerBoost: true
                }).then((audio) => {
                  const tempFile = `${__dirname}/public/audio.mp3`
                  audio.pipe(fs.createWriteStream(tempFile)).on('finish', () => {
                    res.status(200).json({ path: 'audio.mp3' });
                    console.log('O aúdio foi criado completamente!');
                  });
                })
                  .catch(err => {
                    res.status(500).json(err);
                    console.log('Erro:', err);
                  });
              })
          })
          .catch(err => {
            res.status(500).json(err);
            console.log('Erro:', err);
          });
      })
      .on('error', err => {
        console.log('Erro na conversão de áudio:', err);
        res.status(500).send('Erro ao converter o arquivo de áudio.');
      })
      .run();
    // console.log(req.file)







  })
});

app.listen(5000);