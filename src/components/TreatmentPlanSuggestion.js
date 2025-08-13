import React, { useState } from 'react';
import './TreatmentPlanSuggestion.css';
import Tesseract from 'tesseract.js';

function TreatmentPlanSuggestion() {
  const [patientName, setPatientName] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [labReport, setLabReport] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = process.env.REACT_APP_OPENAI;

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError('No file selected. You can proceed without uploading a lab report.');
      setLabReport(null); // Clear any previously uploaded file
      return;
    }
  
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validImageTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image file (JPEG or PNG).');
      return;
    }
  
    setLabReport(file);
    setError(''); // Clear any previous errors
  };
  
  const handleExtractText = async () => {
    if (!labReport) {
      setError('No lab report uploaded. You can proceed without uploading a lab report.');
      setExtractedText(''); // Clear any previously extracted text
      return;
    }
  
    setLoading(true);
    setError('');
    setExtractedText('');
  
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = await Tesseract.recognize(reader.result, 'eng', {
            logger: (info) => console.log(info), // Log OCR progress
          });
          setExtractedText(result.data.text);
        } catch (err) {
          console.error('Error extracting text:', err);
          setError('Failed to extract text from the lab report. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Error reading the file. Please try again.');
        setLoading(false);
      };
      reader.readAsDataURL(labReport); // Read the file as a data URL
    } catch (err) {
      console.error('Error processing the file:', err);
      setError('Failed to process the lab report. Please try again.');
      setLoading(false);
    }
  };

  // Generate treatment plan using OpenAI
  const handleGeneratePlan = async () => {
    // Ensure at least one input is provided: lab report, symptoms, or medical history
    if (!extractedText && !symptoms && !medicalHistory) {
      setError('Please upload a lab report or provide symptoms and medical history to generate a treatment plan.');
      return;
    }
  
    setLoading(true);
    setError('');
    setTreatmentPlan('');
  
    try {
      // Prepare the input for the treatment plan
      const labReportContent = extractedText || 'No lab report provided.';
      const symptomsContent = symptoms || 'No symptoms provided.';
      const medicalHistoryContent = medicalHistory || 'No medical history provided.';
  
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful medical assistant that provides treatment plans based on symptoms, medical history, and lab reports.',
            },
            {
              role: 'user',
              content: `Patient Name: ${patientName}\nSymptoms: ${symptomsContent}\nMedical History: ${medicalHistoryContent}\nLab Report: ${labReportContent}`,
            },
          ],
          max_tokens: 300,
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
  };

  return (
    <div className="treatment-plan-container">
      <h2>AI-Powered Treatment Plans</h2>
      <p className="description">
        Upload a medical lab report to analyze and generate a suggested treatment plan.
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
      <div className="form-group">
        <label htmlFor="medicalHistory">Medical History:</label>
        <textarea
          id="medicalHistory"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          placeholder="Enter medical history (e.g., diabetes, hypertension)"
        />
      </div>
      <div className="form-group">
        <label htmlFor="labReport">Upload Lab Report (Optional):</label>
        <input type="file" id="labReport" onChange={handleFileUpload} />
        <p className="optional-note">You can skip this step if you don't have a lab report.</p>
      </div>
      <div className="button-container">
  <button
    className="extract-button"
    onClick={handleExtractText}
    disabled={loading}
  >
    {loading ? 'Processing...' : 'Extract Text from Lab Report'}
  </button>
  <button
    className="generate-button"
    onClick={handleGeneratePlan}
    disabled={loading || (!extractedText && !symptoms && !medicalHistory)}
  >
    {loading ? 'Generating...' : 'Generate Treatment Plan'}
  </button>
  <button
    className="clear-button"
    onClick={() => {
      setPatientName('');
      setSymptoms('');
      setMedicalHistory('');
      setLabReport(null);
      setExtractedText('');
      setTreatmentPlan('');
      setError('');
    }}
    disabled={loading} // Disable the button while loading
  >
    Clear All Fields
  </button>
</div>
      {error && <p className="error-message">{error}</p>}
      {extractedText && (
        <div className="extracted-text">
          <h3>Extracted Text:</h3>
          <p>{extractedText}</p>
        </div>
      )}
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