import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GameProvider } from './context/GameContext'
import { UIProvider } from './context/UIContext'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <UIProvider>
            <GameProvider>
                <App />
            </GameProvider>
        </UIProvider>
    </React.StrictMode>,
)
