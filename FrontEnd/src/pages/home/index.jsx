import './style.css';
import logo from '/src/assets/logovoiceconnectpng.png';
import { useState } from 'react';

function Home() {
  const [loading, setLoading] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(''); // Novo estado para o nome do arquivo

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFileName(file.name); // Armazena o nome do arquivo selecionado
    }
  };

  const handleSubmit = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowDownloadButton(true);
    }, 2000); // Simulação de tempo de carregamento
  };

  const handleDownload = () => {
    // Obtém o nome do arquivo sem a extensão
    const fileNameWithoutExtension = selectedFileName.split('.').slice(0, -1).join('.');
    const extension = selectedFileName.split('.').pop(); // Obtém a extensão do arquivo
    const translatedFileName = `${fileNameWithoutExtension}_TRADUÇÃO.${extension}`; // Novo nome do arquivo

    // Simulação de download do arquivo
    const link = document.createElement('a');
    link.href = 'path_to_translated_file.mp3'; // Caminho do arquivo traduzido (atualize para o caminho real)
    link.download = translatedFileName; // Define o novo nome para download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Redireciona para a página inicial
    setShowDownloadButton(false);
    setSelectedFileName(''); // Reseta o nome do arquivo após o download
  };

  return (
    <>
      <div className="container">
        <div id="logo">
          <img src={logo} alt="VoiceConnect Logo" />
        </div>
        <h1>Bem Vindo ao VoiceConnect!</h1>
        <p>Selecione o áudio para tradução</p>
        
        {/* Input para seleção do arquivo */}
        <input 
          type="file" 
          accept=".mp3" 
          id="audioFile" 
          style={{ display: 'none' }} 
          onChange={handleFileChange} // Adiciona o evento onChange
        />
        <label htmlFor="audioFile" className="fileLabel">Selecione o áudio</label>

        {/* Exibe o nome do arquivo selecionado */}
        {selectedFileName && <p>Arquivo selecionado: {selectedFileName}</p>}

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
