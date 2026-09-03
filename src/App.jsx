import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Weather from './components/Weather'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Weather />} />
        <Route path="/weather/:city" element={<Weather />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
