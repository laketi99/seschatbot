const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
const pdf = require("pdf-parse");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for PDF uploads
const upload = multer({ dest: "uploads/" });

// OpenAI API setup
const configuration = new Configuration({
    apiKey: "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", // Replace with your actual OpenAI API key
});
const openai = new OpenAIApi(configuration);

// Route for chatbot messages
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message cannot be empty" });
        }

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });

        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("Error in /api/chat:", error.message);
        res.status(500).json({ error: "Error processing chatbot request" });
    }
});

// Route for PDF upload and review generation
app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdf(dataBuffer).catch((err) => {
            console.error("PDF Parsing Error:", err.message);
            return res.status(500).json({ error: "Error parsing PDF" });
        });

        const prompt = `Analyze the following document:\n${pdfData.text}`;

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        const review = response.data.choices[0].message.content;
        res.json({ review });
    } catch (error) {
        console.error("Error in /api/upload:", error.message);
        res.status(500).json({ error: "Error processing PDF upload" });
    }
});

// Set the server to run on port 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
