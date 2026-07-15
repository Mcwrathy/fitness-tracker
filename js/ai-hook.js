// AI assistant hook - Discord webhook integration

const AIHook = {
  // Show chat modal
  showChatModal(currentScreen, sessionDate, focusedExercise) {
    const settings = Storage.getSettings();
    const webhookUrl = settings.discordWebhookUrl;

    if (!webhookUrl) {
      alert('Discord webhook URL not configured. Open Settings to add it.');
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'ai-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #2a2a2a;
      border-radius: 12px;
      padding: 1.5rem;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    `;

    content.innerHTML = `
      <h2 style="margin-top: 0; color: #e8e8e8;">Message Sonya</h2>
      <p style="color: #999; font-size: 0.9rem;">
        Send a message to the fitness tracking team via Discord.
      </p>
      <textarea
        id="ai-message"
        placeholder="Type your question or request..."
        style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #444;
          border-radius: 6px;
          background: #1a1a1a;
          color: #e8e8e8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1rem;
          box-sizing: border-box;
          min-height: 100px;
          resize: vertical;
        "
      ></textarea>
      <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
        <button
          id="ai-cancel"
          style="
            flex: 1;
            padding: 0.75rem;
            background: #444;
            color: #e8e8e8;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
          "
        >Cancel</button>
        <button
          id="ai-send"
          style="
            flex: 1;
            padding: 0.75rem;
            background: #2dd4bf;
            color: #1a1a1a;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
          "
        >Send</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const textarea = document.getElementById('ai-message');
    const sendBtn = document.getElementById('ai-send');
    const cancelBtn = document.getElementById('ai-cancel');

    cancelBtn.onclick = () => modal.remove();

    sendBtn.onclick = () => {
      const message = textarea.value.trim();
      if (!message) {
        alert('Please type a message.');
        return;
      }

      const contextStr = [
        `screen=${currentScreen}`,
        sessionDate ? `session_date=${sessionDate}` : null,
        focusedExercise ? `focused_exercise=${focusedExercise}` : null
      ].filter(Boolean).join(', ');

      const body = {
        content: `**App request from Dan:** ${message}\n\n_Context:_ ${contextStr}`,
        username: 'Fitness App'
      };

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(() => {
          modal.remove();
          const toast = document.createElement('div');
          toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #2dd4bf;
            color: #1a1a1a;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            z-index: 999;
          `;
          toast.textContent = 'Message sent to Sonya!';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        })
        .catch((err) => {
          console.error('Failed to send message:', err);
          alert('Failed to send message. Check the webhook URL.');
        });
    };

    textarea.focus();
  },

  // Create floating chat bubble
  createChatBubble(currentScreen, sessionDate, focusedExercise) {
    const bubble = document.createElement('button');
    bubble.id = 'ai-chat-bubble';
    bubble.innerHTML = '💬';
    bubble.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 16px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2dd4bf;
      border: none;
      color: #1a1a1a;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    `;

    bubble.onmouseover = () => bubble.style.transform = 'scale(1.1)';
    bubble.onmouseout = () => bubble.style.transform = 'scale(1)';
    bubble.onclick = () => AIHook.showChatModal(currentScreen, sessionDate, focusedExercise);

    return bubble;
  }
};
