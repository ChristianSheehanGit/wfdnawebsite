import React, { useState } from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import "./donate.css";

const Donate = () => {
  const [selectedOneTime, setSelectedOneTime] = useState(null);
  const [selectedRecurring, setSelectedRecurring] = useState(null);

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      <div className="donate-section">
        <h2 style={{"fontFamily": "font"}}>Make a Donation</h2>

        <div className="donate-cards">
          {/* One-Time Donation */}
          <div className="donate-card">
            <h3>One-Time</h3>
            <p>
              Make a single donation to support our ongoing investigations and
              family reunification efforts.
            </p>
            <div className="donate-amounts">
               <button className={`amount-btn ${selectedOneTime === "$25" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("$25")}>$25</button>
               <button className={`amount-btn ${selectedOneTime === "$50" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("$50")}>$50</button>
               <button className={`amount-btn ${selectedOneTime === "$100" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("$100")}>$100</button>
               <button className={`amount-btn amount-custom ${selectedOneTime === "Custom" ? "amount-selected" : ""}`} onClick={() => setSelectedOneTime("Custom")}>Custom</button>
             </div>
               <button className="btn btn-green" style={{ width: "100%" }}><i className="fas fa-dollar-sign" style={{marginRight: "5px"}}></i>Donate Now</button>
          </div>

          {/* Monthly Donation */}
          <div className="donate-card">
            <h3>Recurring</h3>
            <p>
              Become a monthly sustainer and provide reliable, recurring support
              that fuels our work year-round.
            </p>
            <div className="donate-amounts">
               <button className={`amount-btn ${selectedRecurring === "$10/mo" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("$10/mo")}>$10/mo</button>
               <button className={`amount-btn ${selectedRecurring === "$25/mo" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("$25/mo")}>$25/mo</button>
               <button className={`amount-btn ${selectedRecurring === "$50/mo" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("$50/mo")}>$50/mo</button>
               <button className={`amount-btn amount-custom ${selectedRecurring === "Custom" ? "amount-selected" : ""}`} onClick={() => setSelectedRecurring("Custom")}>Custom</button>
             </div>
               <button className="btn btn-green" style={{ width: "100%" }}><i className="fas fa-dollar-sign" style={{marginRight: "5px"}}></i>Subscribe Monthly</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Donate;