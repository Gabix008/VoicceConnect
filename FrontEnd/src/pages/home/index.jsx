// Realiza os imports para o código
import './style.css';
import logo from '/src/assets/logovoiceconnectpng.png';
import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
// import {createFFmpeg} from '@ffmpeg/ffmpeg';
// Define o componente Home
function Home() {
  // Define estados usando useState
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const [showPlayButton, setShowPlayButton] = useState(false); // Controla a visibilidade do botão de reprodução
  const [audioURL, setAudioURL] = useState(null); // URL do áudio gravado
  const [translatedAudioURL, setTranslatedAudioURL] = useState(null); // Para o áudio traduzido
  const [isRecording, setIsRecording] = useState(false); // Indica se está gravando
  const mediaRecorder = useRef(null); // Referência para o MediaRecorder
  const recordedChunks = useRef([]); // Armazena os pedaços gravados de áudio
  const [audioBlob, setAudioBlob] = useState(null); // Blob do áudio gravado
  const [audioFile, setAudioFile] = useState(null); // Arquivo de áudio para envio
  const [isSendFile, setIsSendFile] = useState(false); // Indica se o arquivo foi enviado
  const [buttonVisible, setButtonVisible] = useState(true); // Controla a visibilidade do botão de gravação
  const [sourceLang, setSourceLang] = useState('en'); // Idioma en
  const [targetLang, setTargetLang] = useState('pt'); // idioma ptbr
  const [ChangedSelect, setChangedSelect] = useState(null); // Controla qual seletor foi mudado

  // Função para iniciar a gravação
  const handleStartRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => { // Solicita acesso ao microfone
      mediaRecorder.current = new MediaRecorder(stream); // Cria uma nova instância do MediaRecorder
      recordedChunks.current = []; // Reseta os pedaços gravados

      // Evento quando há dados disponíveis
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data); // Adiciona os dados ao array
        }
      };

      // Evento quando a gravação para
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/mp3' }); // Cria um Blob do áudio gravado
        const audioUrl = URL.createObjectURL(audioBlob); // Cria uma URL para o Blob
        const file = new File([audioBlob], "audio.mp3", { type: 'audio/mp3' }); // Cria um arquivo a partir do Blob

        setAudioURL(audioUrl); // Atualiza o estado com a URL do áudio
        setAudioFile(file); // Atualiza o estado com o arquivo de áudio
        setShowPlayButton(true); // Mostra o botão de reprodução
        console.log(file); // Loga o arquivo no console
      };

      mediaRecorder.current.start(); // Inicia a gravação
      setIsRecording(true); // Atualiza o estado para gravando
      setButtonVisible(true) // Torna o botão visível
    });
  };

  // Função para parar a gravação
  const handleStopRecording = () => {
    mediaRecorder.current.stop(); // Para a gravação
    setIsRecording(false); // Atualiza o estado para não gravando
    setButtonVisible(false) // Torna o botão invisível
  };

  // Função para enviar o áudio para tradução
  const handleSubmit = () => {
    setLoading(true); // Ativa o estado de carregamento
    const formData = new FormData(); // Cria um FormData para enviar os dados
    formData.append('audio', audioFile, 'audio.mp3'); // Adiciona o arquivo de áudio
    formData.append('sourceLang', sourceLang); // Adiciona o idioma de origem
    formData.append('targetLang', targetLang); // Adiciona o idioma de destino

    api.post('/recognize', formData, { headers: { 'Content-Type': 'multipart/form-data' } }) // Envia a requisição para a API
      .then(async (response) => {
        if (response.data && response.data.path) { // Verifica a resposta da API
          console.log('Resposta da API:', response); // Loga a resposta da API
          console.log('Dados da API:', response.data.path); // Loga o caminho dos dados da API
          setTranslatedAudioURL(`http://localhost:5000/${response.data.path}?t=${new Date().getTime()}`); // Define a URL do áudio traduzido
          console.log(translatedAudioURL) // Loga a URL do áudio traduzido
          setIsSendFile(true) // Indica que o arquivo foi enviado
        }
      })

      .catch((error) => {
        console.error('Erro ao enviar áudio para tradução:', error);
      })
      .finally(() => {
        setLoading(false); // Define o estado como false após a conclusão da requisição
      });

  };

  // Função para regravar
  const handleReRecord = () => {
    setIsSendFile(false); // Reseta o estado de envio
    setAudioURL(null); // Reseta a URL do áudio
    setTranslatedAudioURL(null); // Reseta a URL do áudio traduzido
    setShowPlayButton(false); // Esconde o botão de reprodução
    setButtonVisible(true) // Torna o botão de gravação visível
  };

  // Função para lidar com a mudança do idioma de origem
  const handleSourceLangChange = (e) => {
    setSourceLang(e.target.value); // Atualiza o idioma de origem
    setChangedSelect('sourceLang'); // Indica que o idioma de origem foi alterado
    console.log('Source language changed:', e.target.value); // Loga a mudança
  };

  // Função para lidar com a mudança do idioma de destino
  const handleTargetLangChange = (e) => {
    setTargetLang(e.target.value); // Atualiza o idioma de destino
    setChangedSelect('targetLang'); // Indica que o idioma de destino foi alterado
    console.log('Target language changed:', e.target.value); // Loga a mudança
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
          style={isSendFile || !buttonVisible ? { display: 'none' } : {}}
        >
          {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
        </button>
        {/* Botão de Enviar para Tradução */}

        <button id="btnSubmit" onClick={handleSubmit} disabled={!audioURL} style={isSendFile ? { display: 'none' } : {}} >Enviar para tradução </button>

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