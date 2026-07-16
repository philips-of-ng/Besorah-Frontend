import { useState } from 'react'
import './App.css'
import CheckIn from './pages/CheckIn'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom' // Aliased here

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path='/checkin' element={<CheckIn />} /> {/* Changed to element */}
      </Routes>
    </Router>
  )
}

export default App