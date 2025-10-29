import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/_global.scss'        // 🆕 använd din globala scss
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css' // 🆕 lägg till detta
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
