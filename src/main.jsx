import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/formCommon.css'
import './styles/staffCommon.css'
import './styles/adminList.css'
import './styles/dashboard.css'
import './styles/staffLogin.css'
import './styles/formImageUpload.css'
import './styles/activities.css'
import './styles/participants.css'
import './styles/staffManagement.css'
import './styles/programs.css'
import './styles/registrations.css'
import './styles/requests.css'
import './styles/cancellations.css'
import './styles/messages.css'
import './styles/statistics.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
