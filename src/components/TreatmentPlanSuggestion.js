import React, { useState } from 'react';
import './TreatmentPlanSuggestion.css';

const symptomsList = [
  'fever',
  'cough',
  'fatigue',
  'headache',
  'nausea',
  'dizziness',
  'chest pain',
  'shortness of breath',
  'abdominal pain',
  'diarrhea',
  'joint pain',
  'swelling',
];

const medicalHistoryList = [
  'diabetes',
  'hypertension',
  'asthma',
  'migraine',
  'anemia',
  'arthritis',
  'high cholesterol',
  'irritable bowel syndrome (IBS)',
  'obesity',
];

function TreatmentPlanSuggestion() {
  const [patientName, setPatientName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [filteredMedicalHistory, setFilteredMedicalHistory] = useState([]);
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  const handleGeneratePlan = async () => {
    console.log('Environment Variables:', process.env);
    console.log('Environment Variables:', process.env.REACT_APP_OPENAI_API_KEY);
    
    if (patientName && symptoms && medicalHistory) {
      setLoading(true);
      setError('');
      setTreatmentPlan('');
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`, // Replace with your OpenAI API key
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful medical assistant that provides treatment plans based on symptoms and medical history.',
              },
              {
                role: 'user',
                content: `Suggest a treatment plan for a patient named ${patientName} with the following symptoms: ${symptoms}. Medical history: ${medicalHistory}.`,
              },
            ],
            max_tokens: 150,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch treatment plan. Please try again.');
        }

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          setTreatmentPlan(data.choices[0].message.content.trim());
        } else {
          throw new Error('Invalid API response structure.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please provide patient name, symptoms, and medical history.');
    }
  };

  const handleSymptomsChange = (e) => {
    const input = e.target.value;
    setSymptoms(input);
    if (input) {
      const suggestions = symptomsList.filter((symptom) =>
        symptom.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSymptoms(suggestions);
    } else {
      setFilteredSymptoms([]);
    }
  };

  const handleMedicalHistoryChange = (e) => {
    const input = e.target.value;
    setMedicalHistory(input);
    if (input) {
      const suggestions = medicalHistoryList.filter((condition) =>
        condition.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredMedicalHistory(suggestions);
    } else {
      setFilteredMedicalHistory([]);
    }
  };

  const handleSymptomSelect = (symptom) => {
    setSymptoms(symptom);
    setFilteredSymptoms([]);
  };

  const handleMedicalHistorySelect = (condition) => {
    setMedicalHistory(condition);
    setFilteredMedicalHistory([]);
  };

  return (
    <div className="treatment-plan-container">
      <h2>AI-Powered Treatment Plans</h2>
      <p className="description">
        Enter the patient's name, symptoms, and medical history to generate a suggested treatment plan.
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
        <input
          type="text"
          id="symptoms"
          value={symptoms}
          onChange={handleSymptomsChange}
          placeholder="Enter symptoms (e.g., fever, cough)"
        />
        {filteredSymptoms.length > 0 && (
          <ul className="suggestions-list">
            {filteredSymptoms.map((symptom, index) => (
              <li key={index} onClick={() => handleSymptomSelect(symptom)}>
                {symptom}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="medicalHistory">Medical History:</label>
        <input
          type="text"
          id="medicalHistory"
          value={medicalHistory}
          onChange={handleMedicalHistoryChange}
          placeholder="Enter medical history (e.g., diabetes, hypertension)"
        />
        {filteredMedicalHistory.length > 0 && (
          <ul className="suggestions-list">
            {filteredMedicalHistory.map((condition, index) => (
              <li key={index} onClick={() => handleMedicalHistorySelect(condition)}>
                {condition}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className="generate-button" onClick={handleGeneratePlan} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Treatment Plan'}
      </button>
      {error && <p className="error-message">{error}</p>}
      {treatmentPlan && (
        <div className="treatment-plan-result">
          <h3>Suggested Treatment Plan:</h3>
          <div className="treatment-plan-content">
            <p>{treatmentPlan}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TreatmentPlanSuggestion;