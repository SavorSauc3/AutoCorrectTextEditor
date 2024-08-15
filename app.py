from flask import Flask, render_template, request, jsonify
from textblob import TextBlob
from googletrans import Translator
from flask_cors import CORS
from flask_caching import Cache
import json
import hashlib

app = Flask(__name__)

# Initialize CORS
CORS(app)

# Initialize Flask-Caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})  # Use 'simple' cache for in-memory caching

# Initialize the translator
translator = Translator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/autocorrect', methods=['POST'])
def autocorrect():
    try:
        request_data = request.json
        text = request_data.get('text', '')
        num_reruns = request_data.get('num_reruns', 1)
        
        # Create a unique cache key based on the serialized request data
        cache_key = create_cache_key(request_data)
        
        # Attempt to get cached response
        cached_response = cache.get(cache_key)
        if cached_response:
            return jsonify(cached_response)
        
        # Process the text and run the translate_block or translate_multiple_blocks function
        if num_reruns > 1:
            corrected_text = translate_multiple_blocks(text, num_reruns)
        else:
            corrected_text = translate_block(text, num_reruns)
        
        # Cache the response
        response = {'corrected_text': corrected_text}
        cache.set(cache_key, response)
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def translate_block(text, num_reruns):
    # Translate to Spanish and then back to English num_reruns times
    for i in range(num_reruns):
        translated_text = translator.translate(text, src='en', dest='zh-cn').text
        text = translator.translate(translated_text, src='zh-cn', dest='en').text
    return text

def translate_multiple_blocks(text, num_reruns):
    # Translate using English -> Spanish -> Chinese -> English, but only from second rerun onwards
    text = translator.translate(text, src='en', dest='zh-cn').text
    text = translator.translate(text, src='zh-cn', dest='en').text
    for i in range(1, num_reruns):
        # Translate to Spanish, Chinese, and back to English
        translated_text = translator.translate(text, src='en', dest='es').text
        translated_text = translator.translate(translated_text, src='es', dest='zh-cn').text
        text = translator.translate(translated_text, src='zh-cn', dest='en').text
    return text

def create_cache_key(request_data):
    """Create a unique cache key based on the serialized request data."""
    # Serialize the request data to a JSON string
    request_str = json.dumps(request_data, sort_keys=True)
    # Create a hash of the serialized string to use as the cache key
    return hashlib.sha256(request_str.encode()).hexdigest()

if __name__ == '__main__':
    app.run(debug=True)
