const express = require('express');
const multer = require('multer');
const app = express();
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const fs = require('fs');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');

//const upload = multer({ dest: 'uploads/' });
const apiKey = '6rr5TGgpnEqOB4bRxeMNp1JZn9_bzR0GJhXBw5KG6rF1'
const url= 'https://api.au-syd.speech-to-text.watson.cloud.ibm.com/instances/d55efdae-e29d-45cf-b729-fa2f3f38b8ca'

const authenticator = new IamAuthenticator({apikey:apiKey});
app.use(express.json())

app.use(
     express.urlencoded({
         extended:true
      })
    )

app.post('/recognize', async (req,res) =>{
  const storage = multer.diskStorage({
    destination: function(req, file, cb){
      cb(null, `${__dirname}/media`);
    },
    filename:function(req, file, cb){
      cb(null,Date.now()+".mp3");
    },
  })
  const upload = multer({storage}).single("audio");

  await upload(req,res, function(err){
    if(err instanceof multer.MulterError){
      return res.status(500).send(err);
    }else if(err){
      return res.status(500).send(err);
    }

    const audioFilePath = `${__dirname}/media/${req.file.filename}`;// Constrói o caminho completo do arquivo de áudio
    console.log(audioFilePath)
    const params ={
      audio: fs.createReadStream(audioFilePath),
      contentType: 'audio/mp3',
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

    const textToSpeech = new TextToSpeechV1({
      authenticator: new IamAuthenticator({
      apikey: 'wH90xTrjnrjRP9oq5o04rUAtnTY07eFpitpiTJd9JOQ0',
      }),
      serviceUrl: 'https://api.au-syd.text-to-speech.watson.cloud.ibm.com/instances/ad461ac3-3425-4a9f-8fdb-52dbe73b7fbb',
    });
  
  
  speechToText.recognize(params)
      .then(response => {
        const translateParams = {
          text: response.result.results[0].alternatives[0].transcript,
          modelId: 'en-pt',
        };
        languageTranslator.translate(translateParams)
          .then(response => {
            const textToSpeechParams = {
              text: response.result.translations[0].translation,
              voice: 'pt-BR_IsabelaVoice', // Escolha a voz adequada
              accept: 'audio/wav',
            }
            console.log(textToSpeechParams)
            textToSpeech.synthesize(textToSpeechParams)
              .then(audio => {
                audio.result.pipe(fs.createWriteStream('texto.wav'));
                
              })
          })
        })
      .catch(err => {
        res.status(500).json(err);
        console.log('Erro:', err);
      });
  })
});

app.listen(5000);