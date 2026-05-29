//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from './assets/vite.svg'
//import heroImg from './assets/hero.png'
//import './App.css'
import { BrowserRouter , Routes , Route} from "react-router-dom"
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import StaffCancellations from "./pages/StaffCancellations";

function App() {
  return(
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<PaymentPage />} />

        <Route path="/staff" element={<StaffCancellations />} />

        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/payment-cancel"
          element={<PaymentCancel />}
        />

      </Routes>
    </BrowserRouter>
  );
}
export default App
