import './style.css';
import logo from '/src/assets/logovoiceconnectpng.png';
import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
// import {createFFmpeg} from '@ffmpeg/ffmpeg';
function Home() {
  const [loading, setLoading] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [translatedAudioURL, setTranslatedAudioURL] = useState(null); // Para o áudio traduzido
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isSendFile, setIsSendFile] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(true);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('pt');
 const [ChangedSelect, setChangedSelect] = useState(null);
  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorder.current = new MediaRecorder(stream);
      recordedChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };


      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const file = new File([audioBlob], "audio.mp3", { type: 'audio/mp3' });

        setAudioURL(audioUrl);
        setAudioFile(file);
        setShowPlayButton(true);
        console.log(file);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setButtonVisible(true)
    });
  };
  



  const handleStopRecording = () => {
    mediaRecorder.current.stop();
    setIsRecording(false);
    setButtonVisible(false)
    
  };


  const handleSubmit = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', audioFile, 'audio.mp3');
    formData.append('sourceLang', sourceLang);
    formData.append('targetLang', targetLang);
    
    api.post('/recognize', formData,{headers: {'Content-Type': 'multipart/form-data'}})
    .then(async(response) => {
      if (response.data && response.data.path) {
      console.log('Resposta da API:', response);
      console.log('Dados da API:', response.data.path);
     setTranslatedAudioURL(`http://localhost:5000/${response.data.path}?t=${new Date().getTime()}`);
     console.log(translatedAudioURL)
     setIsSendFile(true)
      }
    })
    
    .catch((error) => {
      console.error('Erro ao enviar áudio para tradução:', error);
    })
    .finally(() => {
      setLoading(false); // Define o estado como false após a conclusão da requisição
    });
    
  };

  const handleReRecord = () => {
    setIsSendFile(false);
    setAudioURL(null); 
    setTranslatedAudioURL(null); 
    setShowPlayButton(false);
    setButtonVisible(true)
  };



  const handleSourceLangChange = (e) => {
    setSourceLang(e.target.value);
    setChangedSelect('sourceLang');
    console.log('Source language changed:', e.target.value);
  };

  const handleTargetLangChange = (e) => {
    setTargetLang(e.target.value);
    setChangedSelect('targetLang');
    console.log('Target language changed:', e.target.value);
  };
  

  return (
    <>
      <div className="container">
        <div id="logo">
          <img src={logo} alt="VoiceConnect Logo" />
        </div>
        <h1>Bem Vindo ao VoiceConnect!</h1>
        <p>Grave o áudio para tradução</p>
        <p>Selecione o idioma de origem e destino</p>
        <select value={sourceLang} onChange={handleSourceLangChange}>
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            {/* Adicione mais opções conforme necessário */}
          </select>
        <select defaultValue={targetLang} onChange={handleTargetLangChange}>
          <option value="pt">Portuguese</option>
          <option value="en">English</option>
        </select>

        {/* Botão de Gravação */}
       
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`fileLabel ${isRecording ? 'recording' : ''}`}
          style={isSendFile|| !buttonVisible? {display: 'none'} : {}}
        >
          {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
        </button>
        {/* Botão de Enviar para Tradução */}
        
        <button id="btnSubmit" onClick={handleSubmit} disabled={!audioURL} style={isSendFile? {display: 'none'} : {}} >Enviar para tradução </button>

        {/* Botão de Regravação */}
        <button onClick={handleReRecord} className="highlightButton" disabled={!audioURL}>Regravar</button>

        {loading && <p>Carregando...</p>}

        {/* Exibe o Áudio Gravado */}
        {showPlayButton && (
          <div className="audio-section">
            <h3>Áudio Original</h3>
            <audio controls>
              <source src={audioURL} type="audio/mp3" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        )}

        {/* Exibe o Áudio Traduzido */}
        {translatedAudioURL &&
          <div className="audio-section">
            <h3>Áudio Traduzido:</h3>
            <audio controls>
              <source src={translatedAudioURL} type="audio/mp3" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        }
      </div>
    </>
  );
}

export default Home;
