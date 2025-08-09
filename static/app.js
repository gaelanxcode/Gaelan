const ADMIN_EMAIL = 'admin@kurdcine.ai';
const ADMIN_PASS = '123456';

const loginDiv = document.getElementById('login');
const appDiv = document.getElementById('app');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const menuToggle = document.getElementById('menuToggle');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const lightTheme = document.getElementById('lightTheme');
const darkTheme = document.getElementById('darkTheme');

const landing = document.getElementById('landing');
const startInput = document.getElementById('startInput');
const startBtn = document.getElementById('startBtn');

const chat = document.getElementById('chat');
const messagesUl = document.getElementById('messages');
const chatBar = document.getElementById('chatBar');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('modelSelect');

let userType = localStorage.getItem('userType') || 'free';
let conversation = [];

loginBtn.onclick = () => {
    if (emailInput.value === ADMIN_EMAIL && passInput.value === ADMIN_PASS) {
        userType = 'pro';
        localStorage.setItem('userType', 'pro');
        loginDiv.classList.add('hidden');
        appDiv.classList.remove('hidden');
    } else {
        loginError.textContent = 'ئیمەیڵ یان وشەی نهێنی دروست نیە';
    }
};

menuToggle.onclick = () => sideMenu.classList.remove('hidden');
closeMenu.onclick = () => sideMenu.classList.add('hidden');
lightTheme.onclick = () => document.body.classList.add('light');
darkTheme.onclick = () => document.body.classList.remove('light');

startBtn.onclick = () => {
    if (startInput.value.trim()) {
        landing.classList.add('hidden');
        chat.classList.remove('hidden');
        chatBar.classList.remove('hidden');
        sendMessage(startInput.value.trim());
    }
};

sendBtn.onclick = () => {
    if (msgInput.value.trim()) {
        sendMessage(msgInput.value.trim());
        msgInput.value = '';
    }
};

function sendMessage(text) {
    const model = modelSelect.value;
    const key = model === 'pro' ? 'proCount' : 'basicCount';
    let count = parseInt(localStorage.getItem(key) || '0');

    if (userType === 'free') {
        if (model === 'pro' && count >= 5) {
            alert('سنووری پەیام گەیشتە');
            return;
        }
        if (model === 'basic' && count >= 50) {
            alert('سنووری پەیام گەیشتە');
            return;
        }
    } else {
        if (model === 'pro' && count >= 1000) {
            alert('سنووری پەیام گەیشتە');
            return;
        }
    }

    addMessage('user', text);
    conversation.push({ role: 'user', content: text });
    localStorage.setItem(key, count + 1);

    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: conversation })
    })
    .then(r => r.json())
    .then(data => {
        const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (reply) {
            addMessage('ai', reply);
            conversation.push({ role: 'assistant', content: reply });
        } else {
            addMessage('ai', 'هەڵەیەک ڕویدا');
        }
    })
    .catch(() => {
        addMessage('ai', 'هەڵەیەک ڕویدا');
    });
}

function addMessage(role, text) {
    const li = document.createElement('li');
    li.className = role;
    li.textContent = text;
    if (role === 'ai') {
        const copyBtn = document.createElement('span');
        copyBtn.textContent = '📋';
        copyBtn.style.cursor = 'pointer';
        copyBtn.onclick = () => navigator.clipboard.writeText(text);
        li.appendChild(copyBtn);
    }
    messagesUl.appendChild(li);
    messagesUl.scrollTop = messagesUl.scrollHeight;
}
