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

class TranslateController {

    static async recognize(req, res) {
        const modelMapping = {
            'en': 'en-US_BroadbandModel',
            'pt': 'pt-BR_BroadbandModel',
            // Adicione mais mapeamentos conforme necessário
        };
        const voice = new ElevenLabs(
            {
                apiKey: process.env.API_KEY_ELEVEN,
                voiceId: ""

            }
        )
        const authenticator = new IamAuthenticator({ apikey: process.env.API_KEY_IBM });
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, `${__dirname}/../media`);
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
            console.log('Request body:', req.body);

            // Verifique se o corpo da requisição está correto
            const { sourceLang, targetLang } = req.body;
            console.log('sourceLang:', sourceLang);
            console.log('targetLang:', targetLang);
            const modelId = `${sourceLang}-${targetLang}`;

            const speechModel = modelMapping[sourceLang] || 'en-US_BroadbandModel';



            const audioFilePath = `${__dirname}/../media/${req.file.filename}`;// Constrói o caminho completo do arquivo de áudio
            const convertedFilePath = `${__dirname}/../media/${Date.now()}.wav`;

            ffmpeg(audioFilePath)
                .output(convertedFilePath)
                .audioCodec('pcm_s16le')
                .format('wav')
                .on('end', () => {
                    const params = {
                        audio: fs.createReadStream(convertedFilePath),
                        contentType: 'audio/wav',
                        model: speechModel,
                        endOfPhraseSilenceTime: 20,
                        smartFormatting: true,
                    }
                    const speechToText = new SpeechToTextV1({
                        authenticator: authenticator,
                        serviceUrl: process.env.URL_IBM,
                    })
                    const languageTranslator = new LanguageTranslatorV3({
                        version: '2018-05-01',
                        authenticator: new IamAuthenticator({
                            apikey: process.env.API_KEY_IBM_TRANSLATE,
                        }),
                        headers: {
                            'X-Watson-Learning-Opt-Out': 'true'
                        },
                        serviceUrl: process.env.URL_TRANSLATE,
                    });


                    speechToText.recognize(params)
                        .then(response => {
                            const translateParams = {
                                text: response.result.results[0].alternatives[0].transcript,
                                modelId: modelId,
                            };
                            console.log(response.result.results[0].alternatives[0].transcript)
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
                                        const tempFile = `${__dirname}/../public/audio.mp3`
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
    }
}

module.exports = TranslateController;