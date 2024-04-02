
const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const fs = require('fs');

const textToSpeech = new TextToSpeechV1(
  {
   authenticator: new IamAuthenticator({
      apikey: 'wH90xTrjnrjRP9oq5o04rUAtnTY07eFpitpiTJd9JOQ0',
    }),
    serviceUrl: 'https://api.au-syd.text-to-speech.watson.cloud.ibm.com/instances/ad461ac3-3425-4a9f-8fdb-52dbe73b7fbb',
  });

// Synthesize speech and then pipe the results to a file
textToSpeech.synthesize({
    text: 'Olá, vai catar coquinho na praia',
    voice: 'pt-BR_IsabelaV3Voice', 
    accept: 'audio/wav'
})
  .then(response => {
    const audioStream = response.result;
    audioStream.pipe(fs.createWriteStream('texto.wav')); // Salva como arquivo WAV
  })
  .catch(err => {
    console.log('Erro ao sintetizar o discurso:', err);
  });





// const express = require('express');
// const app = express();
// const fs = require('fs');
// const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
// const { IamAuthenticator } = require('ibm-watson/auth');


// app.post('/teste',(req,res) =>{

//     const textToSpeech = new TextToSpeechV1({
//           authenticator: new IamAuthenticator,
//            
//     })

//       textToSpeech.synthesize({
//         text:'Convertendo texto para audio',
//         voice:'pt-BR_IsabelaVoice',
//         accept: 'audio/mp3'
//       })
//       .pipe(fs.createWriteStream('meuAudio.mp3'));
// })
