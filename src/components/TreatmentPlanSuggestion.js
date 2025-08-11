import React, { useState } from 'react';
import symptomsData from '../data/symptomsData.json'; // Import the JSON data
import './TreatmentPlanSuggestion.css';

function TreatmentPlanSuggestion() {
  const [patientName, setPatientName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');

  const handleGeneratePlan = () => {
    if (patientName && symptoms) {
      // Find a matching suggestion from the JSON data
      const matchedSymptom = symptomsData.find((item) =>
        symptoms.toLowerCase().includes(item.symptom.toLowerCase())
      );

      if (matchedSymptom) {
        setTreatmentPlan(
          `Treatment plan for ${patientName}: ${matchedSymptom.suggestion}`
        );
      } else {
        setTreatmentPlan(
          `Treatment plan for ${patientName}: No specific suggestion found for the symptoms "${symptoms}". Please consult a doctor.`
        );
      }
    } else {
      setTreatmentPlan('Please provide both patient name and symptoms.');
    }
  };

  return (
    <div className="treatment-plan-container">
      <h2>AI-Powered Treatment plans</h2>
      <p className="description">
        Enter the patient's name and symptoms to generate a suggested treatment plan.
      </p>
      <div className="form-group">
        <label htmlFor="patientName">Patient Name:</label>
        <input
          type="text"
          id="patientName"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Enter patient name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="symptoms">Symptoms:</label>
        <textarea
          id="symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Enter symptoms (e.g., fever, cough)"
        />
      </div>
      <button className="generate-button" onClick={handleGeneratePlan}>
        Generate Treatment Plan
      </button>
      {treatmentPlan && (
        <div className="treatment-plan-result">
          <h3>Suggested Treatment Plan:</h3>
          <p>{treatmentPlan}</p>
        </div>
      )}
    </div>
  );
}

export default TreatmentPlanSuggestion;