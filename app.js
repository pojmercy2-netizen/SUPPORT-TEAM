/**
 * TRUST Support — Single-Page Live Chat Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 1. Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const body = document.body;

  const currentTheme = localStorage.getItem('trust_chat_theme') || 'light';
  if (currentTheme === 'light') {
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
    body.classList.add('dark-theme');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = body.classList.contains('dark-theme');
      if (isDark) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem('trust_chat_theme', 'light');
        showToast('Switched to Light Theme');
      } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem('trust_chat_theme', 'dark');
        showToast('Switched to Dark Theme');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // 2. Audio Notification Chime (Synthesized via Web Audio API, no external mp3 needed)
  let soundEnabled = true;
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  function playChime() {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext policy
    }
  }

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        soundIcon.setAttribute('data-lucide', 'volume-2');
        showToast('Chat sound enabled');
        playChime();
      } else {
        soundIcon.setAttribute('data-lucide', 'volume-x');
        showToast('Chat sound muted');
      }
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // 3. Live Chat Message Handling
  const chatStream = document.getElementById('chatStream');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const typingBar = document.getElementById('typingBar');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const attachBtn = document.getElementById('attachBtn');
  const hiddenFileInput = document.getElementById('hiddenFileInput');

  function scrollToBottom() {
    if (chatStream) {
      chatStream.scrollTop = chatStream.scrollHeight;
    }
  }

  function appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble user-bubble';
    bubble.innerHTML = `
      <div class="bubble-body">
        <div class="bubble-content">
          <p>${escapeHtml(text)}</p>
        </div>
        <span class="bubble-time">Just now</span>
      </div>
    `;
    chatStream.appendChild(bubble);
    scrollToBottom();
  }

  function appendBotMessage(html) {
    playChime();
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble bot-bubble';
    bubble.innerHTML = `
      <div class="bubble-avatar">
        <img src="PUBLIC/logo.jpeg" alt="TRUST">
      </div>
      <div class="bubble-body">
        <div class="bubble-content">
          ${html}
        </div>
        <span class="bubble-time">Just now</span>
      </div>
    `;
    chatStream.appendChild(bubble);
    scrollToBottom();
    if (window.lucide) window.lucide.createIcons();
  }

  function triggerBotResponse(userQuery) {
    // Show typing indicator
    if (typingBar) {
      typingBar.style.display = 'flex';
      scrollToBottom();
    }

    const delay = Math.min(1200, Math.max(600, userQuery.length * 20));

    setTimeout(() => {
      if (typingBar) typingBar.style.display = 'none';

      const q = userQuery.toLowerCase();
      let replyHtml = '';

      if (q.includes('transaction') || q.includes('stuck') || q.includes('pending') || q.includes('gas') || q.includes('fail')) {
        replyHtml = `
          <p>Regarding your transaction inquiry:</p>
          <p>Blockchain transactions usually delay due to sudden network gas fee fluctuations. You can:</p>
          <ul style="padding-left: 18px; margin: 6px 0;">
            <li>Select <strong>Speed Up</strong> in your transfer history to boost priority fees.</li>
            <li>Or select <strong>Cancel</strong> to release the pending transaction nonce.</li>
          </ul>
          <p>Would you like to share your public transaction hash for a quick node lookup?</p>
        `;
      } else if (q.includes('security') || q.includes('seed') || q.includes('phrase') || q.includes('key') || q.includes('hack')) {
        replyHtml = `
          <p>🛡️ <strong>TRUST Security Notice:</strong></p>
          <p>TRUST is completely non-custodial. We will <strong>never</strong> ask for your 12/24-word recovery phrase or private keys.</p>
          <p>If you suspect unauthorized activity, disconnect active dApps immediately and transfer uncompromised assets to a clean hardware/cold wallet.</p>
        `;
      } else if (q.includes('token') || q.includes('staking') || q.includes('reward') || q.includes('apy') || q.includes('apr')) {
        replyHtml = `
          <p>For custom tokens and staking rewards:</p>
          <p>1. Custom tokens can be added by pasting the verified contract address into the <em>Add Custom Token</em> option.</p>
          <p>2. Staking yields are distributed per validator epoch schedule. Note that unstaking incurs an unbonding cooldown per blockchain protocol rules.</p>
        `;
      } else if (q.includes('scam') || q.includes('fraud') || q.includes('phishing') || q.includes('report')) {
        replyHtml = `
          <p>🚨 <strong>Fraud Escalation Desk:</strong></p>
          <p>Thank you for reporting this. Please share the suspicious URL or contract address here so our security engineers can add it to our automated malicious domain blocker.</p>
        `;
      } else if (q.includes('human') || q.includes('agent') || q.includes('representative') || q.includes('live person')) {
        replyHtml = `
          <p>🟢 Connected to <strong>Senior Specialist Marcus (TRUST Global Tier-2)</strong>.</p>
          <p><em>"Hello! I am reviewing your request. Please share your wallet address or specific error message so I can assist you directly."</em></p>
        `;
      } else {
        replyHtml = `
          <p>Thank you for reaching out to <strong class="brand-name-blue">TRUST</strong> Support.</p>
          <p>A specialist is connected to this session. Please describe your issue or paste any transaction hash / error message you are seeing.</p>
        `;
      }

      appendBotMessage(replyHtml);
    }, delay);
  }

  // Handle Form Submit
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message) return;

      appendUserMessage(message);
      chatInput.value = '';
      triggerBotResponse(message);
    });
  }

  // Handle Quick Topic Buttons
  document.querySelectorAll('.topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.getAttribute('data-topic');
      if (topic) {
        appendUserMessage(`I need help with: ${topic}`);
        triggerBotResponse(topic);
      }
    });
  });

  // Clear Chat Button
  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (confirm('Clear current live support session?')) {
        chatStream.innerHTML = `
          <div class="system-message">
            <i data-lucide="lock"></i>
            <span>Session refreshed • Connected to TRUST Help Desk</span>
          </div>
          <div class="message-bubble bot-bubble">
            <div class="bubble-avatar">
              <img src="PUBLIC/logo.jpeg" alt="TRUST">
            </div>
            <div class="bubble-body">
              <div class="bubble-content">
                <p>Hello! Welcome back to <strong class="brand-name-blue">TRUST</strong> Live Support. How may we assist you?</p>
              </div>
              <span class="bubble-time">Just now</span>
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        showToast('Chat history cleared');
      }
    });
  }

  // File Attachment Simulation
  if (attachBtn && hiddenFileInput) {
    attachBtn.addEventListener('click', () => {
      hiddenFileInput.click();
    });

    hiddenFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        appendUserMessage(`[Attached File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]`);
        triggerBotResponse('attached screenshot or document');
        hiddenFileInput.value = '';
      }
    });
  }

  // 4. Live Chat Service Integration Modal (Tawk.to, Crisp, etc.)
  const connectChatServiceBtn = document.getElementById('connectChatServiceBtn');
  const connectModal = document.getElementById('connectModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const saveIntegrationBtn = document.getElementById('saveIntegrationBtn');
  const chatEmbedCode = document.getElementById('chatEmbedCode');

  // Load existing code if saved
  const savedEmbed = localStorage.getItem('trust_live_chat_embed');
  if (savedEmbed) {
    chatEmbedCode.value = savedEmbed;
    injectLiveChatScript(savedEmbed);
  }

  function openModal() {
    connectModal.style.display = 'flex';
  }
  function closeModal() {
    connectModal.style.display = 'none';
  }

  if (connectChatServiceBtn) connectChatServiceBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  if (saveIntegrationBtn) {
    saveIntegrationBtn.addEventListener('click', () => {
      const scriptCode = chatEmbedCode.value.trim();
      if (scriptCode) {
        localStorage.setItem('trust_live_chat_embed', scriptCode);
        injectLiveChatScript(scriptCode);
        showToast('External Live Chat connected!');
      } else {
        localStorage.removeItem('trust_live_chat_embed');
        showToast('Using built-in TRUST live chat');
      }
      closeModal();
    });
  }

  function injectLiveChatScript(rawHtmlOrScript) {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawHtmlOrScript;
      const scripts = tempDiv.getElementsByTagName('script');
      for (let s of scripts) {
        const newScript = document.createElement('script');
        if (s.src) {
          newScript.src = s.src;
          newScript.async = true;
        } else {
          newScript.textContent = s.textContent;
        }
        document.body.appendChild(newScript);
      }
    } catch (err) {
      console.warn('Could not inject chat script:', err);
    }
  }

  // Toast Utility
  function showToast(text) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = text;
    wrap.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[s]);
  }
});
