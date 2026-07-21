import React from "react";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import { useImages } from "./ImageContext.jsx";
import "./App.css";

const Services = () => {
  const { getImage } = useImages();

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>

      <div className="section-law-enforcement">
        {/* LEFT — text */}
        <div className="left">
          <p style={{width:"80%", textAlign: "center", fontWeight: "bold"}}>Law Enforcement</p>
          <p style={{width:"80%", marginBottom: "10px"}}>Wolf Pack DNA partners with law enforcement agencies to apply forensic genetic genealogy to unsolved cases involving unidentified human remains and unknown offenders of violent crime. Our team analyzes DNA profiles and builds family trees to generate actionable leads where traditional investigative methods have stalled. We work directly with detectives, medical examiners, and prosecutors throughout the investigative process, providing the analysis needed to identify victims, generate suspect leads, and support exoneration efforts. Our services are provided at no cost to agencies.</p>
            <button className="btn btn-blue" onClick={() => window.location.href = "/inquiry/law-enforcement"}>
              Make an Inquiry
            </button>
        </div>

        {/* RIGHT — image */}
        <div className="right">
          {getImage("law-enforcement") ? (
            <img src={getImage("law-enforcement")} alt="Law Enforcement" className="about-img" />
          ) : (
            <div className="about-img-placeholder" />
          )}
        </div>
      </div>

      <div className="section-genetic-genealogy">
        <div className="left">
          {getImage("genetic-genealogy") ? (
            <img src={getImage("genetic-genealogy")} alt="Genetic Genealogy" className="about-img" />
          ) : (
            <div className="about-img-placeholder" />
          )}
        </div>
        <div className="right">
            <p style={{width:"80%", textAlign: "center", fontWeight: "bold"}}>Genetic Genealogy</p>
          <p style={{width:"80%", marginBottom: "10px"}}>For individuals searching for biological family, Wolf Pack DNA offers genetic genealogy research to help uncover biological origins and reconnect with relatives. Whether you're an adoptee searching for birth parents, donor-conceived, or simply trying to fill in gaps in your family history, our researchers use DNA testing results combined with traditional genealogical records to build accurate family trees and identify potential matches. We guide you through every step of the process, from submitting a DNA sample to interpreting results, at no cost to those we serve.</p>
            <button className="btn btn-blue" onClick={() => window.location.href = "/inquiry/genetic-genealogy"}>
                Make an Inquiry
            </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
