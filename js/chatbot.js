/**
 * Rajeshwari AI Chatbot Client (Powered by Groq LLM)
 */
(function () {
  'use strict';

  // Elements
  const launcher = document.getElementById('chatbot-launcher');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('chatbot-close-btn');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send-btn');
  const messagesContainer = document.getElementById('chatbot-messages');
  const chips = document.querySelectorAll('.chatbot-chip');

  if (!launcher || !panel) return;

  // State
  let conversationHistory = [];
  let isAwaitingReply = false;

  // Toggle Chatbot
  function openChat() {
    panel.classList.add('is-active');
    panel.setAttribute('aria-hidden', 'false');
    launcher.style.display = 'none';
    setTimeout(() => {
      input && input.focus();
    }, 200);
  }

  function closeChat() {
    panel.classList.remove('is-active');
    panel.setAttribute('aria-hidden', 'true');
    launcher.style.display = 'flex';
  }

  launcher.addEventListener('click', openChat);
  closeBtn && closeBtn.addEventListener('click', closeChat);

  // Robust Markdown Formatter (supports tables, headers, lists, code, bold, links)
  function formatMarkdown(text) {
    if (!text) return '';

    // Normalize line endings
    let raw = text.replace(/\r\n/g, '\n');

    // Escape HTML to prevent injection
    let escaped = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced Code Blocks: ```code```
    escaped = escaped.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
      return `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`;
    });

    // Inline Code: `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

    // Bold & Italic
    escaped = escaped.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links: [text](url)
    escaped = escaped.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Process line-by-line for blocks (headers, lists, tables)
    const lines = escaped.split('\n');
    let outHtml = [];
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    let inTable = false;
    let tableRows = [];

    function flushTable() {
      if (!inTable) return;
      if (tableRows.length > 0) {
        let tableHtml = '<div class="chat-table-wrap"><table>';
        tableRows.forEach((row, rIdx) => {
          // Check if separator row (e.g., |---|---|)
          const isSeparator = row.every(cell => /^:?-+:?$/.test(cell.trim()));
          if (isSeparator) return;

          const tag = rIdx === 0 ? 'th' : 'td';
          tableHtml += '<tr>';
          row.forEach(cell => {
            tableHtml += `<${tag}>${cell.trim()}</${tag}>`;
          });
          tableHtml += '</tr>';
        });
        tableHtml += '</table></div>';
        outHtml.push(tableHtml);
      }
      tableRows = [];
      inTable = false;
    }

    function flushList() {
      if (!inList) return;
      outHtml.push(`</${listType}>`);
      inList = false;
      listType = null;
    }

    lines.forEach(line => {
      const trimmed = line.trim();

      // Check Table Row: | col1 | col2 |
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList();
        inTable = true;
        const cells = trimmed.slice(1, -1).split('|');
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Horizontal Rule
      if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        flushList();
        outHtml.push('<hr class="chat-divider" />');
        return;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        flushList();
        outHtml.push(`<h4 class="chat-heading-3">${trimmed.slice(4)}</h4>`);
        return;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        outHtml.push(`<h3 class="chat-heading-2">${trimmed.slice(3)}</h3>`);
        return;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        outHtml.push(`<h2 class="chat-heading-1">${trimmed.slice(2)}</h2>`);
        return;
      }

      // Bullet Lists: •, -, or *
      if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
          outHtml.push('<ul>');
        }
        let itemContent = trimmed.startsWith('•') ? trimmed.slice(1).trim() : trimmed.slice(2).trim();
        outHtml.push(`<li>${itemContent}</li>`);
        return;
      }

      // Numbered Lists: 1. , 2.
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
          outHtml.push('<ol>');
        }
        outHtml.push(`<li>${numMatch[2]}</li>`);
        return;
      }

      // Regular line
      flushList();
      if (trimmed) {
        outHtml.push(`<p>${trimmed}</p>`);
      }
    });

    flushList();
    flushTable();

    return outHtml.join('');
  }

  // Append Message to UI
  function appendMessage(role, content) {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg msg-${role}`;

    if (role === 'assistant') {
      msgEl.innerHTML = `
        <div class="chat-msg-avatar">
          <img src="assets/images/rajeshwari_hero_teal.jpg" alt="Rajeshwari's Copilot" />
        </div>
        <div class="chat-msg-bubble">
          ${formatMarkdown(content)}
        </div>
      `;
    } else {
      msgEl.innerHTML = `
        <div class="chat-msg-bubble">
          <p>${escapeHtml(content)}</p>
        </div>
      `;
    }

    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Typing Indicator Element
  let typingIndicator = null;
  function showTyping() {
    if (typingIndicator) return;
    typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-msg msg-assistant';
    typingIndicator.innerHTML = `
      <div class="chat-msg-avatar">
        <img src="assets/images/rajeshwari_hero_teal.jpg" alt="Rajeshwari's Copilot" />
      </div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    if (typingIndicator) {
      typingIndicator.remove();
      typingIndicator = null;
    }
  }

  // Client-Side Intelligence Engine (Fallback for static hosting like GitHub Pages)
  function getOfflineResponse(rawText) {
    const text = (rawText || '').toLowerCase().trim();

    if (text.includes('who are you') || text.includes('who is rajeshwari') || text.includes('about') || text.includes('profile')) {
      return `**Rajeshwari S C** is a premier **Business Analyst & Enterprise Strategist** at **Elien**, and an active Board Member on the **Board of Innovation & Tech at Hridayamrit Foundation**.\n\nShe specializes in bridging deep-tech software architecture and strategic enterprise delivery across software, industrial engineering, and civil construction. Her motto: *"Technology without strategy is noise. Strategy without technology is slow. I build the bridge between both."*`;
    }

    if (text.includes('elien') || text.includes('current role') || text.includes('job') || text.includes('work')) {
      return `At **Elien**, Rajeshwari serves as **Business Analyst & Enterprise Strategist**, orchestrating requirements engineering, system integration, and agile delivery across three high-impact portfolios:\n- **Digital Software**: Product specs, API data flows, and UI/UX roadmaps\n- **Industrial Engineering**: ERP integration, supply chain transparency, and factory floor logistics\n- **Civil Construction**: Infrastructure project management and agile milestone governance`;
    }

    if (text.includes('foundation') || text.includes('hridayamrit') || text.includes('board') || text.includes('cardiac') || text.includes('ngo')) {
      return `Rajeshwari serves on the **Board of Innovation & Technology** at the **Hridayamrit Foundation**.\n\nShe directs digital healthcare roadmaps, AI-driven diagnostics integration, and remote patient monitoring initiatives aimed at democratizing life-saving cardiac care for underserved communities across India.`;
    }

    if (text.includes('domain') || text.includes('expertise') || text.includes('skill') || text.includes('what do you do') || text.includes('special')) {
      return `Rajeshwari commands mastery across **4 Core Domains**:\n\n1. **Digital Software Systems**: API design specs, cloud data architecture, user stories, and acceptance test criteria.\n2. **Industrial Engineering**: Heavy machinery workflows, SCADA/IoT data points, and supply chain ERP modules.\n3. **Civil Construction**: Infrastructure project lifecycle management, contractor coordination, and agile sprint tracking.\n4. **Agile & Enterprise Governance**: Cross-functional team leadership, executive alignment, and sprint cadence management.`;
    }

    if (text.includes('method') || text.includes('approach') || text.includes('framework') || text.includes('how do you work') || text.includes('strategy')) {
      return `Rajeshwari operates on a rigorous **3-Step Strategic Methodology**:\n\n1. **Listen First**: In-depth executive stakeholder discovery, root-cause discovery, and operational baseline audits.\n2. **Translate Precisely**: Converting ambiguous strategic goals into clear functional specifications, API contracts, and engineering backlogs.\n3. **Deliver Iteratively**: Sprint-by-sprint increments, continuous stakeholder demos, and quantifiable business ROI.`;
    }

    if (text.includes('contact') || text.includes('hire') || text.includes('reach') || text.includes('email') || text.includes('connect')) {
      return `You can connect directly with Rajeshwari:\n- **LinkedIn**: [Rajeshwari on LinkedIn](https://linkedin.com)\n- **Instagram**: [@rajeshwari](https://instagram.com)\n- **Inquiry**: You can also submit the contact form right at the bottom of this portfolio!`;
    }

    if (text.includes('reel') || text.includes('video') || text.includes('instagram') || text.includes('presence')) {
      return `Check out the **Executive Presence & Reels** gallery right here on the portfolio! Rajeshwari shares high-impact executive insights on agile transformation, enterprise decision-making, and cross-functional leadership. Click on any video card in the gallery to watch in full view!`;
    }

    return `Thank you for asking! Rajeshwari is a **Business Analyst & Enterprise Strategist** at **Elien** and Board Member at **Hridayamrit Foundation**.\n\nFeel free to explore her **Case Studies**, **Interactive Media Gallery**, or ask about her work across **Digital Software**, **Industrial Systems**, and **Agile Leadership**!`;
  }

  // Send Message Logic
  async function sendMessage(text) {
    const cleanText = (text || '').trim();
    if (!cleanText || isAwaitingReply) return;

    // Display user message
    appendMessage('user', cleanText);
    conversationHistory.push({ role: 'user', content: cleanText });

    // Clear input & disable button
    if (input) input.value = '';
    isAwaitingReply = true;
    if (sendBtn) sendBtn.disabled = true;

    showTyping();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      hideTyping();

      const reply = data.reply || 'Thank you for asking! How else can I assist you?';
      appendMessage('assistant', reply);
      conversationHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      hideTyping();
      console.warn('Backend unavailable, using client-side knowledge engine:', err);
      const fallbackReply = getOfflineResponse(cleanText);
      appendMessage('assistant', fallbackReply);
      conversationHistory.push({ role: 'assistant', content: fallbackReply });
    } finally {
      isAwaitingReply = false;
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  }

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(input.value);
    });
  }

  // Quick suggestion chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt') || chip.textContent;
      sendMessage(prompt);
    });
  });

  // Close panel on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-active')) {
      closeChat();
    }
  });

})();
