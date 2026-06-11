import Home from "./pages/HomePages/Home.jsx";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Plus60Page from "./pages/HomePages/Plus60Page.jsx";
import AboutPage from "./pages/HomePages/AboutPage.jsx";
import ServicesPage from "./pages/HomePages/ServicesPage.jsx";

function App() {
   return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plus60" element={<Plus60Page />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;