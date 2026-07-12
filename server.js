const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default or via env PORT

// Serve static assets from the current directory
app.use(express.static(path.join(__dirname)));

// Health check ping endpoint to keep the server awake
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Fallback to index.html for Single Page Application routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`West Matrimony server is running live on port ${PORT}`);
});
