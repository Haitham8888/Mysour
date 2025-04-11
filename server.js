require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const sharp = require('sharp');
const MarkdownIt = require('markdown-it');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI client
const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

// Initialize markdown-it
const md = new MarkdownIt();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/Mysour/static', express.static(path.join(__dirname, 'static')));
app.use('/Mysour/templates', express.static(path.join(__dirname, 'templates')));

// Format code blocks function
function formatCodeBlocks(text) {
    let html = md.render(text);
    html = html.replace(/<pre>/g, '<pre class="code-block">');
    html = html.replace(/<code>/g, '<code class="code-content">');
    return html;
}

// Process image function
async function processImage(imageData) {
    try {
        const base64Data = imageData.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Process image with sharp
        const processedBuffer = await sharp(imageBuffer)
            .jpeg()
            .toBuffer();
            
        return processedBuffer.toString('base64');
    } catch (error) {
        throw new Error(`Error processing image: ${error.message}`);
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.post('/Mysour/chat', async (req, res) => {
    const { message, image } = req.body;
    
    try {
        const messages = [
            {
                role: "system",
                content: "You are a helpful AI assistant that can understand both text and images. When providing code examples, always format them using markdown code blocks with appropriate language syntax highlighting."
            }
        ];

        if (image) {
            const processedImage = await processImage(image);
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: message || "What is in this image?"
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${processedImage}`
                        }
                    }
                ]
            });
        } else {
            messages.push({
                role: "user",
                content: message
            });
        }

        const completion = await client.chat.completions.create({
            extraHeaders: {
                "HTTP-Referer": process.env.SITE_URL,
                "X-Title": process.env.SITE_NAME,
            },
            model: "qwen/qwen2.5-vl-3b-instruct:free",
            messages: messages
        });

        const reply = completion.choices[0].message.content;
        const formattedReply = formatCodeBlocks(reply);
        
        res.json({ reply: formattedReply });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ reply: `Error: ${error.message}` });
    }
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'logo.png'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 