import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DarkModeProvider } from './components/DarkModeContext'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <DarkModeProvider>
      <App />
    </DarkModeProvider>
  </HashRouter>,
)
