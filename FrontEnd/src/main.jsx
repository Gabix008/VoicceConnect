import { StrictMode } from 'react' // O StrictMode é uma ferramenta usada no desenvolvimento para destacar potenciais problemas, como comportamentos obsoletos e efeitos colaterais indesejados.
import { createRoot } from 'react-dom/client' // Função moderna usada para criar e gerenciar o ponto de montagem da aplicação React na árvore DOM.
import Home from './pages/home' // Importa o componente principal "Home" da pasta de páginas, que será renderizado.
import './index.css' // Importa os estilos globais aplicados em toda a aplicação.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Home /> // Renderiza o componente "Home" dentro de StrictMode para verificar problemas potenciais na árvore de componentes.
  </StrictMode>,
)
