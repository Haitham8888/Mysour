from flask import Flask, render_template, request, jsonify, send_from_directory
from openai import OpenAI
import os
from dotenv import load_dotenv
import markdown
import re
import base64
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Validate API key availability
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    print("ERROR: OPENROUTER_API_KEY is missing or empty")
else:
    print(f"API key loaded: {api_key[:8]}...")

app = Flask(__name__)

# Initialize OpenAI client with OpenRouter configuration
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

def format_code_blocks(text):
    # Convert markdown code blocks to HTML
    html = markdown.markdown(text, extensions=['fenced_code', 'codehilite'])
    
    # Add custom styling for code blocks
    html = html.replace('<pre>', '<pre class="code-block">')
    html = html.replace('<code>', '<code class="code-content">')
    
    return html

def process_image(image_data):
    try:
        # Decode base64 image data
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to JPEG and encode as base64
        buffered = io.BytesIO()
        image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        raise Exception(f"Error processing image: {str(e)}")

@app.route("/")
def index():
    return render_template("index.html")  # Loads the frontend

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_input = data.get("message")
    image_data = data.get("image")
    
    try:
        messages = [
            {
                "role": "system",
                "content": "You are a helpful AI assistant that can understand both text and images. When providing code examples, always format them using markdown code blocks with appropriate language syntax highlighting."
            }
        ]

        if image_data:
            # Process the image
            processed_image = process_image(image_data)
            
            # Add image message
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": user_input or "What is in this image?"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{processed_image}"
                        }
                    }
                ]
            })
        else:
            # Add text-only message
            messages.append({
                "role": "user",
                "content": user_input
            })

        # Print debug information
        print(f"Making API request to model: qwen/qwen2.5-vl-3b-instruct:free")
        print(f"Using API key starting with: {api_key[:8]}...")
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:5000"),
                "X-Title": os.getenv("SITE_NAME", "Mysour"),
            },
            model="qwen/qwen2.5-vl-3b-instruct:free",
            messages=messages
        )
        
        reply = completion.choices[0].message.content
        formatted_reply = format_code_blocks(reply)
        return jsonify({"reply": formatted_reply})
    except Exception as e:
        error_msg = str(e)
        print(f"Error in chat endpoint: {error_msg}")
        
        # Add debugging for authentication errors
        if "401" in error_msg and "auth" in error_msg.lower():
            print("Authentication error detected. Please check:")
            print("1. API key format (should start with 'sk-or-')")
            print("2. API key validity in OpenRouter dashboard")
            print("3. Correct API URL (https://openrouter.ai/api/v1)")
        
        return jsonify({"reply": f"Error: {error_msg}"}), 500

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                              'logo.png', mimetype='image/vnd.microsoft.icon')

if __name__ == "__main__":
    app.run(debug=True)