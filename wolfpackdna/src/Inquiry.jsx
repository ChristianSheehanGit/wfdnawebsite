import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./components/navbar.jsx";
import Footer from "./components/footer.jsx";
import "./App.css";
import "./inquiry.css";

const lawEnforcementSteps = [
  {
    title: "Contact Information",
    fields: [
      { name: "firstName", label: "First Name", required: true, type: "text" },
      { name: "lastName", label: "Last Name", required: true, type: "text" },
      { name: "jobTitle", label: "Job Title", required: true, type: "text" },
      { name: "phoneNumber", label: "Phone Number", required: true, type: "text" },
      { name: "emailAddress", label: "Email Address", required: true, type: "text" },
    ],
  },
  {
    title: "Location & Agency",
    fields: [
      { name: "stateRegion", label: "State/Province/Region", required: true, type: "text" },
      { name: "county", label: "County", required: true, type: "text" },
      { name: "country", label: "Country", required: true, type: "text" },
      { name: "agencyName", label: "Agency Name", required: true, type: "text" },
    ],
  },
  {
    title: "Case Details",
    fields: [
      { name: "codisProfile", label: "Has a profile been entered into CODIS?", required: true, type: "select", options: ["Yes", "No"] },
      { name: "approvedLabs", label: "If a violent crime – are you familiar with which laboratories are approved for use per your state laws to ensure admissibility in court?", required: true, type: "text" },
      { name: "priorDnaTesting", label: "Are you aware of any prior DNA testing being done? If so, who performed the analysis?", required: true, type: "text" },
      { name: "samplesAvailable", label: "What samples are available for DNA testing? (ex. blood card, hair, teeth, semen, tissue etc.)", required: true, type: "text" },
      { name: "caseName", label: "Name of case if applicable (ex. Cary Jane Doe)", required: false, type: "text" },
      { name: "namusNumber", label: "NamUs Number (if applicable)", required: false, type: "text" },
    ],
  },
  {
    title: "Additional Information",
    fields: [
      { name: "previousIgg", label: "Has anyone previously attempted to utilize investigative genetic genealogy regarding this case before? If yes, how was your experience and who provided the services?", required: false, type: "text" },
      { name: "otherInfo", label: "Do you have any other relevant information you believe is useful in regards to the case? (ex. links, articles etc.)", required: false, type: "text" },
      { name: "heardAbout", label: "How did you hear about us?", required: false, type: "select", options: ["Instagram", "X", "TikTok", "Facebook", "LinkedIn", "Other"] },
    ],
  },
];

const geneticGenealogySteps = [
  {
    title: "Contact Information",
    fields: [
      { name: "firstName", label: "First Name", required: true, type: "text" },
      { name: "lastName", label: "Last Name", required: true, type: "text" },
      { name: "emailAddress", label: "Email Address", required: true, type: "text" },
      { name: "phoneNumber", label: "Phone Number", required: true, type: "text" },
      { name: "dateOfBirth", label: "Date of Birth", required: true, type: "text" },
      { name: "placeOfBirth", label: "Place of Birth", required: true, type: "text" },
    ],
  },
  {
    title: "DNA & Research History",
    fields: [
      { name: "dnaTest", label: "Have you taken a DNA test? If so, which service? (e.g., AncestryDNA, 23andMe, MyHeritage, FamilyTreeDNA etc.)", required: true, type: "text" },
      { name: "dnaUpload", label: "Have you uploaded your DNA data to any public databases? If so, which one(s)? (e.g., GEDmatch, FamilyTreeDNA)", required: true, type: "text" },
      { name: "previousResearch", label: "Have you conducted any genealogical research previously?", required: true, type: "select", options: ["Yes", "No"] },
    ],
  },
  {
    title: "Search Details",
    fields: [
      { name: "searchingFor", label: "If applicable – are you searching for information regarding your biological mother, father, or both?", required: true, type: "text" },
      { name: "researchFindings", label: "If you have conducted previous genealogical research, please describe your findings below.", required: false, type: "text" },
      { name: "additionalInfo", label: "Do you have any additional information that you believe could be helpful regarding research into your unknown parentage? (e.g. names, dates, locations etc.)", required: false, type: "text" },
      { name: "heardAbout", label: "How did you hear about us?", required: false, type: "select", options: ["Instagram", "X", "TikTok", "Facebook", "LinkedIn", "Other"] },
    ],
  },
];

const Inquiry = () => {
  const { type } = useParams();
  const isLawEnforcement = type === "law-enforcement";
  const steps = isLawEnforcement ? lawEnforcementSteps : geneticGenealogySteps;
  const title = isLawEnforcement ? "Law Enforcement Inquiry" : "Genetic Genealogy Inquiry";

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [otherText, setOtherText] = useState("");

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    const currentFields = steps[currentStep].fields;
    for (const field of currentFields) {
      if (field.required && !formData[field.name]?.trim()) {
        return;
      }
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (submitted) {
    return (
      <div>
        <Navbar />
        <div style={{ height: "46.1px" }}></div>
        <div className="inquiry-container">
          <div className="inquiry-submitted">
            <p style={{ fontWeight: "bold" }}>Inquiry Submitted</p>
            <p>Thank you for your submission. Someone from our team will be in contact with you shortly.</p>
            <button className="inq-btn" onClick={() => { setCurrentStep(0); setFormData({}); setSubmitted(false); setOtherText(""); }}>
              Submit Another Inquiry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ height: "46.1px" }}></div>
      <div className="inquiry-container">
        <p className="inquiry-title" style={{ fontWeight: "bold" }}>{title}</p>

        <div className="inquiry-progress">
          {steps.map((step, index) => (
            <div key={index} className={`inquiry-step-indicator ${index === currentStep ? "active" : index < currentStep ? "completed" : ""}`}>
              <span className="inquiry-step-number">{index + 1}</span>
              <span className="inquiry-step-label">{step.title}</span>
            </div>
          ))}
        </div>

        <div className="inquiry-form">
          <p className="inquiry-step-title" style={{ fontWeight: "bold" }}>{steps[currentStep].title}</p>

          {steps[currentStep].fields.map((field) => (
            <div key={field.name} className="inquiry-field">
              <label className="inquiry-label">
                {field.label} {field.required && <span style={{ color: "rgba(0,0,0,0.7)" }}>*</span>}
              </label>
              {field.type === "select" ? (
                <>
                  <select
                    className="inquiry-select"
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {field.name === "heardAbout" && formData[field.name] === "Other" && (
                    <input
                      className="inquiry-input"
                      type="text"
                      placeholder="Please specify..."
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                    />
                  )}
                </>
              ) : (
                <input
                  className="inquiry-input"
                  type="text"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="inquiry-buttons">
            {currentStep > 0 && (
              <button className="inq-btn" onClick={handleBack}>Back</button>
            )}
            <button className="inq-btn" onClick={handleNext}>
              {currentStep < steps.length - 1 ? "Next" : "Submit"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Inquiry;