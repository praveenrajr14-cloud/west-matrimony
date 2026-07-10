const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000; // Render uses port 10000 by default or via env PORT

// Serve static assets from the current directory
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for Single Page Application routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`West Matrimony server is running live on port ${PORT}`);
});
