import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Learn from './pages/Learn'
import ModuleDetail from './pages/ModuleDetail'
import Playground from './pages/Playground'
import ConfigBuilder from './pages/ConfigBuilder'
import CheatSheet from './pages/CheatSheet'
import Quiz from './pages/Quiz'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:moduleId" element={<ModuleDetail />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/build" element={<ConfigBuilder />} />
        <Route path="/reference" element={<CheatSheet />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </Layout>
  )
}
