import Home from "./pages/Home";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Plus60Page from "./pages/Plus60Page.jsx";

function App() {
   return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plus60" element={<Plus60Page />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;