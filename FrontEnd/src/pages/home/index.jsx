import './style.css'
import logo from '/src/assets/logovoiceconnectpng.png';
import { useState } from 'react';

function Home() {
  const [loading, setLoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);

  const handleSubmit = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowDownloadButton(true);
    }, 2000); // Simulação de tempo de carregamento
  };

  const handleDownload = () => {
    // Simulação de download do arquivo
    const link = document.createElement('a');
    link.href = 'path_to_translated_file.mp3'; // Caminho do arquivo traduzido
    link.download = 'translated_file.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Redireciona para a página inicial
    setShowDownloadButton(false);
  };

  return (
    <>
      <div className="container">
        <div id="logo">
          <img src={logo} alt="VoiceConnect Logo" />
        </div>
        <h1>Bem Vindo ao VoiceConnect!</h1>
        <p>Selecione o áudio para tradução</p>
        <input type="file" accept=".mp3" id="audioFile" style={{ display: 'none' }} />
        <label htmlFor="audioFile" className="fileLabel">Selecione o áudio</label>
        <button id="btnSubmit" onClick={handleSubmit}>Enviar para tradução</button>

        {loading && <p>Carregando...</p>}

        {showDownloadButton && (
          <button className="highlightButton" onClick={handleDownload}>
            Baixar Tradução
          </button>
        )}
      </div>
    </>
  );
}

export default Home;
