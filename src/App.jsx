import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainPage from './pages/MainPage'
import DetailPage from './pages/DetailPage'

const App = () => {
  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={ <MainPage />}/>
      <Route path='/pokemon/:id' element={ <DetailPage />} />
    </Routes>
   </BrowserRouter>
  )
}

export default App