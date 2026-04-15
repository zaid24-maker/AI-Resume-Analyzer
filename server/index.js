const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const analyzeRoute = require("./routes/analyze");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", analyzeRoute);


app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});