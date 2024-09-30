
// importações de dependencias
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
    //Método para reconhecimento e tradução do aúdio
    static async recognize(req, res) {
        //Mapeia os idiomas para o modelo de fala
        const modelMapping = {
            'en': 'en-US_BroadbandModel',
            'pt': 'pt-BR_BroadbandModel',
        };
        //Passa as credenciais da API 
        const voice = new ElevenLabs(
            {
                apiKey: process.env.API_KEY_ELEVEN,
                voiceId: ""
            }
        )

        //Cria o autenticador para a API da IBM
        const authenticator = new IamAuthenticator({ apikey: process.env.API_KEY_IBM });
        // Configura o armazenamento para o multer
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, `${__dirname}/../media`);// Define o diretório de destino para o upload
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + ".mp3"); // Define o nome do arquivo
            },
        })
        const upload = multer({ storage }).single("audio");

        //Faz o upload do aúdio
        await upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).send(err);
            } else if (err) {
                return res.status(500).send(err);
            }
            console.log('Request body:', req.body);

            // Define as linguagens de origem e destino
            const { sourceLang, targetLang } = req.body;
            const modelId = `${sourceLang}-${targetLang}`;

            const speechModel = modelMapping[sourceLang] || 'en-US_BroadbandModel'; //Seleciona o modelo de fala correspondente ao que foi passado na requisição


            // Construi os caminhos dos arquivos de áudio
            const audioFilePath = `${__dirname}/../media/${req.file.filename}`;
            const convertedFilePath = `${__dirname}/../media/${Date.now()}.wav`;

            // Converte o arquivo de áudio de mp3 para wav usando ffmpeg
            ffmpeg(audioFilePath)
                .output(convertedFilePath)
                .audioCodec('pcm_s16le')
                .format('wav')
                .on('end', () => {
                    // Prepara os parâmetros para a API de reconhecimento de fala
                    const params = {
                        audio: fs.createReadStream(convertedFilePath),
                        contentType: 'audio/wav',
                        model: speechModel,
                        endOfPhraseSilenceTime: 20,// Tempo de silêncio ao final das frases
                        smartFormatting: true,// Formatação inteligente
                    }
                    // Inicializa a API de Speech to Text
                    const speechToText = new SpeechToTextV1({
                        authenticator: authenticator,
                        serviceUrl: process.env.URL_IBM,
                    })
                    // Inicializa a API de Language Translator
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

                    // Chama a API de reconhecimento de fala
                    speechToText.recognize(params)
                        .then(response => {
                            const translateParams = {
                                text: response.result.results[0].alternatives[0].transcript,
                                modelId: modelId,
                            };

                            languageTranslator.translate(translateParams)
                                .then(async (response) => {


                                    voice.textToSpeechStream({
                                        fileName: "audio.mp3",
                                        textInput: response.result.translations[0].translation,
                                        voiceId: 'QJd9SLe6MVCdF6DR0EAu',
                                        stability: 0.54,// Estabilidade da voz
                                        similarityBoost: 0.36,// Aumento da similaridade
                                        modelId: "eleven_multilingual_v2", // ID do modelo
                                        responseType: "stream", // Tipo de resposta
                                        speakerBoost: true// Aumento do volume do locutor
                                    }).then((audio) => {
                                        // Cria um arquivo de áudio a partir do fluxo
                                        const tempFile = `${__dirname}/../public/audio.mp3`
                                        audio.pipe(fs.createWriteStream(tempFile)).on('finish', () => {
                                            // Retorna o caminho do áudio criado
                                            res.status(200).json({ path: 'audio.mp3' });
                                            console.log('O aúdio foi criado completamente!');
                                        });

                                    })
                                        .catch(err => {
                                            // Retorna erro se houver um erro na criação do áudio
                                            res.status(500).json(err);
                                            console.log('Erro:', err);
                                        });
                                })
                        })
                        .catch(err => {
                            // Retorna erro se houver um erro na transcrição
                            res.status(500).json(err);
                            console.log('Erro:', err);
                        });
                })
                .on('error', err => {
                    console.log('Erro na conversão de áudio:', err);
                    res.status(500).send('Erro ao converter o arquivo de áudio.');
                })
                .run();
        })
    }
}

module.exports = TranslateController;