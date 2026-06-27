import { useState } from 'react'
import './App.css'
import CheckIn from './pages/CheckIn'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <CheckIn />
    </>
  )
}

export default App
