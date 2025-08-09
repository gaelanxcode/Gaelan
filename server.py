import os
from flask import Flask, request, send_from_directory, jsonify
import requests

app = Flask(__name__, static_folder='static')

API_KEY = os.environ.get('OPENROUTER_KEY', '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')

MODEL_MAP = {
    'basic': 'qwen/qwen3-235b-a22b-thinking-2507',
    'pro': 'anthropic/claude-sonnet-4'
}

SYSTEM_PROMPT = (
    "جاوب بە کوردی سۆرانی تەنها. ئەگەر بەکارهێنەر پرسیاری 'کێ دروستت کردوە؟' بکات، بڵێ GaelanKRD."
    " ئەگەر بپرسی 'تۆ کییەی؟' بڵێ 'من KurdCine AI یم'." 
    " ناوەکانی مۆدێلەکان مەبین، تەنها وەک هەڵوێستەکانی KurdCine Basic و KurdCine Pro وەڵام بدە."
)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('static', path)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    model_key = data.get('model', 'basic')
    messages = data.get('messages', [])

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {API_KEY}',
        'HTTP-Referer': 'https://kurdcine.example',
        'X-Title': 'KurdCine AI'
    }

    payload = {
        'model': MODEL_MAP.get(model_key, MODEL_MAP['basic']),
        'messages': [{'role': 'system', 'content': SYSTEM_PROMPT}] + messages
    }

    try:
        resp = requests.post('https://openrouter.ai/api/v1/chat/completions', headers=headers, json=payload, timeout=60)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))
