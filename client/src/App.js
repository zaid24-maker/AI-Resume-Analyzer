import jsPDF from 'jspdf';
import React, { useState } from 'react';
import './App.css';

function ScoreBar({ label, score }) {
  const getColor = () => {
    if (score >= 71) return '#48bb78';
    if (score >= 41) return '#ecc94b';
    return '#fc8181';
  };

  return (
    <div className="score-bar-container">
      <div className="score-bar-header">
        <span className="score-label">{label}</span>
        <span className="score-number">{score}/100</span>
      </div>
      <div className="score-bar-bg">
        <div
          className="score-bar-fill"
          style={{
            width: `${score}%`,
            backgroundColor: getColor(),
          }}
        ></div>
      </div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid PDF only!');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload a PDF file first!');
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.analysis);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text('AI Resume Analysis Report', 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, y, { align: 'center' });
    y += 20;

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Overall Score: ${result.overallScore}/100`, 20, y);
    y += 10;
    doc.text(`ATS Score: ${result.atsScore}/100`, 20, y);
    y += 20;

    doc.setFontSize(14);
    doc.setTextColor(72, 187, 120);
    doc.text('Strengths', 20, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    result.strengths.forEach((item) => {
      doc.text(`• ${item}`, 25, y);
      y += 8;
    });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(252, 129, 129);
    doc.text('Weaknesses', 20, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    result.weaknesses.forEach((item) => {
      doc.text(`• ${item}`, 25, y);
      y += 8;
    });
    y += 10;

    doc.setFontSize(14);
    doc.setTextColor(237, 137, 54);
    doc.text('Suggestions', 20, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    result.suggestions.forEach((item) => {
      doc.text(`• ${item}`, 25, y);
      y += 8;
    });

    doc.save('resume-analysis.pdf');
  };

  return (
    <div className="container">
      <h1>AI Resume Analyzer 🤖</h1>
      <p>Upload your resume and get instant AI feedback!</p>

      <div
        className={`upload-section ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📄</div>
        <p className="upload-text">
          {file ? `${file.name}` : 'Drag & Drop your resume here'}
        </p>
        <p className="upload-subtext">or click to browse</p>
        <label className="file-label">
          Browse File
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
        <button className="analyze-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>AI is analyzing your resume...</p>
        </div>
      )}

      {result && (
        <div className="result">
          <ScoreBar label="Overall Score" score={result.overallScore} />
          <ScoreBar label="ATS Score" score={result.atsScore} />
          <button className="download-btn" onClick={handleDownload}>
            📄 Download Report
          </button>
          <div className="section">
            <h3> Strengths</h3>
            <ul>
              {result.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="section">
            <h3> Weaknesses</h3>
            <ul>
              {result.weaknesses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="section">
            <h3> Suggestions</h3>
            <ul>
              {result.suggestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
