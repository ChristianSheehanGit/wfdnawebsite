import React from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import "./donate.css";

const Donate = () => {
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
              <button className="amount-btn">$25</button>
              <button className="amount-btn">$50</button>
              <button className="amount-btn">$100</button>
              <button className="amount-btn amount-custom">Custom</button>
            </div>
            <button className="donate-submit-btn">Donate Now</button>
          </div>

          {/* Monthly Donation */}
          <div className="donate-card">
            <h3>Recurring</h3>
            <p>
              Become a monthly sustainer and provide reliable, recurring support
              that fuels our work year-round.
            </p>
            <div className="donate-amounts">
              <button className="amount-btn">$10/mo</button>
              <button className="amount-btn">$25/mo</button>
              <button className="amount-btn">$50/mo</button>
              <button className="amount-btn amount-custom">Custom</button>
            </div>
            <button className="donate-submit-btn">Subscribe Monthly</button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Donate;