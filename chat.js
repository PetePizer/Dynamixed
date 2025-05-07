document.addEventListener('DOMContentLoaded', () => {
    const chatToggleBtn = document.querySelector('.chat-toggle-btn');
    const chatBox = document.querySelector('.chat-box');
    const closeChatBtn = document.querySelector('.close-chat-btn');
    const chatForm = document.querySelector('.chat-form');
    const chatMessages = document.querySelector('.chat-messages');

    chatToggleBtn.addEventListener('click', () => {
        chatBox.classList.toggle('hidden');
    });

    closeChatBtn.addEventListener('click', () => {
        chatBox.classList.add('hidden');
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = chatForm.querySelector('input');
        const message = input.value.trim();
        if (message) {
            const userMessage = document.createElement('div');
            userMessage.textContent = message;
            userMessage.style.textAlign = 'right';
            chatMessages.appendChild(userMessage);
            input.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
});
