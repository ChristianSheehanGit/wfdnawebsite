import { HashRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Home from "./Home.jsx";
import Services from "./Services.jsx";
import Team from "./Team.jsx";
import Cases from "./Cases.jsx";
import Donate from "./Donate.jsx";
import Inquiry from "./Inquiry.jsx";

function App() {
  return (
    <div
      className="App"
      style={{
        fontFamily: '"Font", monospace',
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/team" element={<Team/>} />
          <Route path="/services" element={<Services/>} />
          <Route path="/cases" element={<Cases/>} />
          <Route path="/donate" element={<Donate/>} />
          <Route path="/inquiry/:type" element={<Inquiry/>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
