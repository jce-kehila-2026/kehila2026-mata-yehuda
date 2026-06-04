import { BrowserRouter } from "react-router-dom";

import Routes from "./routes/Routes.jsx";
import "./styles/global.css";
import "./styles/community-theme.css";

function App() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  );
}

export default App;
