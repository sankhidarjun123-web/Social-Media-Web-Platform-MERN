import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ProfileProvider } from './contexts/ProfileContext.jsx'
import { NetworkProvider } from './contexts/NetworkContext.jsx'
import { ChatProvider } from './contexts/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ProfileProvider>
        <NetworkProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </NetworkProvider>
      </ProfileProvider>
    </AuthProvider>
  </BrowserRouter>
)
