const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const router = express.Router();
const multer = require(`multer`);
const { extractTextFromPDF } = require(`../utils/pdfParser`);
const { GoogleGenerativeAI } = require(`@google/generative-ai`);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post(`/analyze`, upload.single(`resume`), async (req, res) => {
    try{
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: `Missing GEMINI_API_KEY in server environment.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: `Please upload a resume PDF file.`,
      });
    }

    const resumeText = await extractTextFromPDF(req.file.buffer); 
    const model = genAI.getGenerativeModel({ model: `gemini-2.5-flash-lite`});

    const prompt = `
      You are an expert resume reviewer. Analyze the following resume and provide:
      1. Overall Score (out of 100)
      2. Strengths (3-5 points)
      3. Weaknesses (3-5 points)
      4. Suggestions to improve (3-5 points)
      5. ATS Score (out of 100)

      Respond in this exact JSON format:
      {
        "overallScore": 75,
        "atsScore": 70,
        "strengths": ["point 1", "point 2", "point 3"],
        "weaknesses": ["point 1", "point 2", "point 3"],
        "suggestions": ["point 1", "point 2", "point 3"]
      }

      Resume:
      ${resumeText}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const cleaned = response.replace(/```json|```/g, ``).trim();
    const analysis = JSON.parse(cleaned);

    res.json({ success: true, analysis });

} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
}
});

module.exports = router;