const express = require('express');
const app = express();

// Other endpoints remain unchanged

// Updated ai-tutor endpoint using Groq
app.get('/ai-tutor', async (req, res) => {
    try {
        const response = await groqQueryFunction(); // Implement your Groq query here
        res.json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Other endpoints remain unchanged

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
