const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Parse JSON bodies
app.use(express.json());

// Handle specific pages for root level (must come before /:lang route)
app.get('/features', (req, res) => {
    res.sendFile(path.join(__dirname, 'features.html'));
});

app.get('/reserve', (req, res) => {
    res.sendFile(path.join(__dirname, 'reserve', 'index.html'));
});

// Serve the main index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve language-specific index pages
app.get('/:lang', (req, res) => {
    const lang = req.params.lang;
    const validLanguages = ['fr', 'es', 'it', 'de', 'ar', 'ru', 'ko'];
    
    if (validLanguages.includes(lang)) {
        const indexPath = path.join(__dirname, lang, 'index.html');
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Language not found');
    }
});

// Serve language-specific reservation pages
app.get('/:lang/reserve', (req, res) => {
    const lang = req.params.lang;
    const validLanguages = ['fr', 'es', 'it', 'de', 'ar', 'ru', 'ko'];
    
    if (validLanguages.includes(lang)) {
        const reservePath = path.join(__dirname, lang, 'reserve', 'index.html');
        res.sendFile(reservePath);
    } else {
        res.status(404).send('Language not found');
    }
});

// Serve language-specific features pages
app.get('/:lang/features', (req, res) => {
    const lang = req.params.lang;
    const validLanguages = ['fr', 'es', 'it', 'de', 'ar', 'ru', 'ko'];
    
    if (validLanguages.includes(lang)) {
        const featuresPath = path.join(__dirname, lang, 'features.html');
        res.sendFile(featuresPath);
    } else {
        res.status(404).send('Language not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
