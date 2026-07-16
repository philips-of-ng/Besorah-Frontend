import { useState } from 'react'
import './App.css'
import CheckIn from './pages/CheckIn'
import { Router, Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path='/checkin' Component={<CheckIn />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
