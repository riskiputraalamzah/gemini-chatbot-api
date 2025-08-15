(function () {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  if (!form || !input || !chatBox) {
    console.error(
      "Missing required DOM elements: #chat-form, #user-input, #chat-box"
    );
    return;
  }

  // Ensure the chat container has the expected class so existing CSS applies
  if (!chatBox.classList.contains("chat-box")) {
    chatBox.classList.add("chat-box");
  }

  // Accessibility: announce new messages
  chatBox.setAttribute("aria-live", "polite");

  // Configuration
  // Use absolute origin to avoid issues when the app is served under a base path
  const API_ENDPOINT = (window?.location?.origin || "") + "/api/chat";
  const REQUEST_TIMEOUT_MS = 30000; // 30s
  const GROUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes for grouping consecutive messages

  // Helpers
  function formatTime(date) {
    try {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      // fallback
      return (
        date.getHours().toString().padStart(2, "0") +
        ":" +
        date.getMinutes().toString().padStart(2, "0")
      );
    }
  }

  function createMessageElement(role, text, options) {
    options = options || {};
    const wrapper = document.createElement("div");
    wrapper.className =
      `message ${role}` + (options.thinking ? " thinking" : "");
    wrapper.dataset.timestamp = (options.time || Date.now()).toString();

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = text;

    const ts = document.createElement("div");
    ts.className = "message-timestamp";
    ts.textContent = formatTime(new Date(Number(wrapper.dataset.timestamp)));

    wrapper.appendChild(content);
    wrapper.appendChild(ts);
    return wrapper;
  }

  function appendMessage(role, text, options) {
    options = options || {};
    const time = options.time || Date.now();
    const el = createMessageElement(
      role,
      text,
      Object.assign({}, options, { time })
    );

    // Try to compact into the previous message group if same role and within window
    const lastChild = chatBox.lastElementChild;
    let appendedToGroup = false;

    if (lastChild && lastChild.classList.contains("message-group")) {
      const groupRole = lastChild.dataset.role;
      const lastBubble = lastChild.querySelector(".message:last-of-type");
      if (groupRole === role && lastBubble) {
        const lastTime = Number(lastBubble.dataset.timestamp) || 0;
        if (time - lastTime <= GROUP_WINDOW_MS) {
          // append to existing group
          lastChild.appendChild(el);
          appendedToGroup = true;
        }
      }
    }

    if (!appendedToGroup) {
      // create a new group container
      const group = document.createElement("div");
      group.className = "message-group";
      group.dataset.role = role;
      group.appendChild(el);
      chatBox.appendChild(group);
      // add a clearing element so floats behave
      const clear = document.createElement("div");
      clear.style.clear = "both";
      chatBox.appendChild(clear);
    }

    // scroll the chat container to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
    return el;
  }

  function replaceMessage(el, role, text) {
    if (!el) return;
    el.className = `message ${role}`;
    const content = el.querySelector(".message-content");
    if (content) content.textContent = text;
    // update timestamp to now
    const ts = el.querySelector(".message-timestamp");
    const now = Date.now();
    if (ts) ts.textContent = formatTime(new Date(now));
    el.dataset.timestamp = now.toString();
    // scroll the chat container to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function setControlsDisabled(disabled) {
    input.disabled = disabled;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = disabled;
  }

  async function sendMessageToServer(userMessage, placeholderEl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const body = JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      });

      // Debug: show exact request URL and payload (helps diagnose 404s on deploy)
      console.debug("POST", API_ENDPOINT, body);

      const resp = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        console.error("Server responded with status", resp.status);
        replaceMessage(
          placeholderEl,
          "bot",
          "Failed to get response from server."
        );
        return;
      }

      let data;
      try {
        data = await resp.json();
      } catch (err) {
        console.error("Failed to parse JSON from /api/chat", err);
        replaceMessage(placeholderEl, "bot", "Sorry, no response received.");
        return;
      }

      const result =
        data && typeof data.result === "string" ? data.result.trim() : null;
      if (!result) {
        replaceMessage(placeholderEl, "bot", "Sorry, no response received.");
        return;
      }

      replaceMessage(placeholderEl, "bot", result);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.warn("Request timed out");
        replaceMessage(
          placeholderEl,
          "bot",
          "Request timed out. Failed to get response from server."
        );
      } else {
        console.error("Network or other error while calling /api/chat", err);
        replaceMessage(
          placeholderEl,
          "bot",
          "Failed to get response from server."
        );
      }
    }
  }

  // Submit handler
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Append user's message
    appendMessage("user", userMessage);

    // Clear input and keep focus
    input.value = "";
    input.focus();

    // Append placeholder bot message
    const placeholder = appendMessage("bot", "Thinking...", { thinking: true });

    // Disable while waiting (optional, prevents duplicate submissions)
    setControlsDisabled(true);

    sendMessageToServer(userMessage, placeholder).finally(() => {
      setControlsDisabled(false);
      input.focus();
    });
  });

  // Allow Enter to submit from input
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  });
})();
