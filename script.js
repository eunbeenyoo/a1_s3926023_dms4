
    // ================= CONFIG =================
    const GEMINI_API_KEY = "AIzaSyAWNO9wExNWVlWB9s1ti03mLz-IZkZwIa0"; // 네 키
    const GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      GEMINI_API_KEY;

    const OPENLIB_PLACEHOLDER =
      "https://via.placeholder.com/90x135.png?text=Book";

    // ================= STATE =================
    const chatWindow = document.getElementById("chatWindow");
    const chipRow = document.getElementById("chipRow");
    const textInput = document.getElementById("textInput");
    const sendButton = document.getElementById("sendButton");
    const stepLabel = document.getElementById("stepLabel");
    const inputHint = document.getElementById("inputHint");
    const rightTop = document.getElementById("rightTop");
    const restartButton = document.getElementById("restartButton");
    const toastContainer = document.getElementById("toastContainer");

    const state = {
      step: 0,
      feelings: [],
      triggers: [],
      bookKinds: [],
      extraNote: "",
      quotes: [],
      currentQuoteIndex: 0,
      selectedQuote: null,
      recommending: false,
      recommendedBooks: []
    };

    const FEELING_OPTIONS = [
      "happy",
      "grateful",
      "calm",
      "content",
      "hopeful",
      "motivated",
      "anxious",
      "worried",
      "tense",
      "panicky",
      "sad",
      "down",
      "grieving",
      "tired",
      "empty",
      "burned out",
      "angry",
      "irritated",
      "frustrated",
      "lonely",
      "isolated",
      "numb",
      "overwhelmed",
      "stressed",
      "lost"
    ];

    const TRIGGER_OPTIONS = [
      "family",
      "parents",
      "children",
      "relationships",
      "breakup",
      "marriage",
      "friendship",
      "school",
      "grades",
      "career",
      "work",
      "money",
      "health",
      "self-esteem",
      "body image",
      "identity",
      "future",
      "language / culture",
      "moving to a new place",
      "burnout",
      "creative block",
      "self-care",
      "loneliness",
      "grief"
    ];

    const BOOK_KIND_OPTIONS = [
      "healing essay",
      "personal essay",
      "self-help",
      "psychology",
      "mindfulness",
      "philosophy",
      "memoir",
      "biography",
      "business / productivity",
      "career guidance",
      "relationships",
      "family & parenting",
      "spirituality",
      "poetry",
      "short stories",
      "contemporary novel",
      "literary novel",
      "romance novel",
      "fantasy novel",
      "mystery / thriller",
      "YA fiction",
      "graphic novel",
      "inspirational non-fiction"
    ];

    // ================ TOAST ===================
    function showToast(msg, type = "info") {
      const div = document.createElement("div");
      div.className = "toast " + (type === "error" ? "error" : "");
      div.textContent = msg;
      toastContainer.appendChild(div);
      requestAnimationFrame(() => div.classList.add("show"));
      setTimeout(() => {
        div.classList.remove("show");
        setTimeout(() => div.remove(), 180);
      }, 2600);
    }

    // ================ CHAT HELPERS =============
    function addAssistantMessage(text) {
      const row = document.createElement("div");
      row.className = "bubble-row";
      const bubble = document.createElement("div");
      bubble.className = "bubble assistant-bubble";
      bubble.textContent = text;
      row.appendChild(bubble);
      chatWindow.appendChild(row);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function addUserMessage(text) {
      const row = document.createElement("div");
      row.className = "bubble-row";
      const bubble = document.createElement("div");
      bubble.className = "bubble user-bubble";
      bubble.textContent = text;
      row.appendChild(bubble);
      chatWindow.appendChild(row);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // ================ INPUT / CHIPS =============
    function clearChips() {
      chipRow.innerHTML = "";
    }

    function createChips(options, selectedList) {
      clearChips();
      options.forEach((opt) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip";
        chip.textContent = opt;
        chip.addEventListener("click", () => {
          if (!selectedList.includes(opt)) {
            selectedList.push(opt);
          } else {
            const idx = selectedList.indexOf(opt);
            selectedList.splice(idx, 1);
          }
          textInput.value = selectedList.join(", ");
          chip.classList.toggle("selected");
        });
        chipRow.appendChild(chip);
      });
    }

    function setupStep() {
      textInput.value = "";
      textInput.disabled = false;
      sendButton.disabled = false;
      chipRow.style.display = "flex";

      if (state.step === 0) {
        createChips(FEELING_OPTIONS, state.feelings);
        textInput.placeholder = "Selected feelings will appear here…";
        addAssistantMessage(
          "First, which feelings describe you right now? You can pick as many as you like."
        );
      } else if (state.step === 1) {
        createChips(TRIGGER_OPTIONS, state.triggers);
        textInput.placeholder = "Selected triggers will appear here…";
        addAssistantMessage(
          "What is mostly triggering these feelings lately? For example, work, family, money, relationships…"
        );
      } else if (state.step === 2) {
        createChips(BOOK_KIND_OPTIONS, state.bookKinds);
        textInput.placeholder = "Selected book types will appear here…";
        addAssistantMessage(
          "What kind of book feels right today? Healing essays, psychology, romance or fantasy novels, poetry…?"
        );
      } else if (state.step === 3) {
        clearChips();
        chipRow.style.display = "none";
        textInput.placeholder =
          "(Optional) Add anything you want to tell me in your own words, or leave empty and press Send";
        addAssistantMessage(
          "If you want, you can add anything in your own words. Or press Send right away to skip this."
        );
      } else {
        textInput.disabled = true;
        sendButton.disabled = true;
        startQuoteFlow();
      }
    }

    function handleSend() {
      const raw = textInput.value.trim();

      if (state.step === 0) {
        const answer =
          raw || (state.feelings.length ? state.feelings.join(", ") : "");
        if (!answer) {
          showToast("Pick at least one feeling or type a word.", "error");
          return;
        }
        addUserMessage(answer);
        state.step++;
        setupStep();
      } else if (state.step === 1) {
        const answer =
          raw || (state.triggers.length ? state.triggers.join(", ") : "");
        if (!answer) {
          showToast("Pick at least one trigger or type a word.", "error");
          return;
        }
        addUserMessage(answer);
        state.step++;
        setupStep();
      } else if (state.step === 2) {
        const answer =
          raw || (state.bookKinds.length ? state.bookKinds.join(", ") : "");
        if (!answer) {
          showToast(
            "Choose at least one book type so I can stay close to your taste.",
            "error"
          );
          return;
        }
        addUserMessage(answer);
        state.step++;
        setupStep();
      } else if (state.step === 3) {
        if (raw) {
          state.extraNote = raw;
          addUserMessage(raw);
        } else {
          addUserMessage("(Skip)");
        }
        state.step++;
        setupStep();
      }
    }

    sendButton.addEventListener("click", handleSend);
    textInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });

    // =============== GEMINI HELPERS =================
    async function callGeminiJSON(promptText) {
      if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
        throw new Error(
          "Gemini API key is not set. Put your key in GEMINI_API_KEY."
        );
      }

      const body = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const res = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error("Gemini HTTP " + res.status + ": " + txt);
      }

      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error("Empty response from Gemini.");
      try {
        return JSON.parse(raw);
      } catch (e) {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) return JSON.parse(m[0]);
        throw new Error("Gemini returned non-JSON text.");
      }
    }

    // =============== OPEN LIBRARY (COVER) ============
    async function fetchCoverForTitle(title, author) {
      if (!title) return OPENLIB_PLACEHOLDER;

      // 제목 정리
      let t = String(title).trim();
      t = t.replace(/^["“”'‘’]+|["“”'‘’]+$/g, "");
      const colonIdx = t.indexOf(":");
      if (colonIdx > 0) t = t.slice(0, colonIdx);
      const dashIdx = t.indexOf(" - ");
      if (dashIdx > 0) t = t.slice(0, dashIdx);
      t = t.trim();

      async function trySearch(paramsObj) {
        const params = new URLSearchParams(paramsObj);
        const url = "https://openlibrary.org/search.json?" + params.toString();
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const doc = data.docs && data.docs[0];
        if (!doc) return null;

        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
        }
        if (doc.isbn && doc.isbn.length > 0) {
          return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
        }
        return null;
      }

      try {
        let cover =
          await trySearch({ title: t, author: author || "", limit: "1" });

        if (!cover) cover = await trySearch({ title: t, limit: "1" });
        if (!cover) cover = await trySearch({ q: t, limit: "1" });

        return cover || OPENLIB_PLACEHOLDER;
      } catch (e) {
        console.warn("cover lookup failed:", e);
        return OPENLIB_PLACEHOLDER;
      }
    }

    // =============== QUOTE & BOOK LOGIC ==============
    function buildQuotePrompt() {
      return `
You are a gentle therapeutic assistant called "Therapeutic Book Finder".

The user shared:
- Feelings: ${state.feelings.join(", ") || "not specified"}
- Triggers: ${state.triggers.join(", ") || "not specified"}
- Preferred book types: ${state.bookKinds.join(", ") || "not specified"}
- Extra note: ${state.extraNote || "none"}

Return ONLY a JSON object:

{
  "quotes": [
    {
      "text": "string, one short quotation",
      "speaker": "person or character name",
      "source_book_title": "book title where this appears",
      "is_fictional_character": true or false
    }
  ]
}

Guidelines:
- Provide 5 quotes.
- Mix non-fiction (essays, psychology, self-help, philosophy) and fiction if the user's book types include any kind of novel or story.
- Choose quotes that could genuinely support the user’s feelings and triggers.
- Make sure book titles and speakers are reasonably accurate.
- Respond with JSON only, no markdown, no extra commentary.
`;
    }

    function buildBookPrompt(selectedQuote) {
      return `
You are a caring reading guide.

User context:
- Feelings: ${state.feelings.join(", ") || "not specified"}
- Triggers: ${state.triggers.join(", ") || "not specified"}
- Preferred book types: ${state.bookKinds.join(", ") || "not specified"}
- Extra note: ${state.extraNote || "none"}

The quote that resonated with them:
- Text: "${selectedQuote.text}"
- Speaker: "${selectedQuote.speaker || "Unknown"}"
- Source book: "${selectedQuote.source_book_title || "Unknown"}"
- Fictional character: ${selectedQuote.is_fictional_character ? "true" : "false"}

Return ONLY a JSON object like this:

{
  "books": [
    {
      "title": "book title",
      "author": "author name or 'Unknown'",
      "is_fiction": true or false,
      "reason": "2–3 sentences: why this book fits the user now, warm and supportive tone",
      "key_line": "one short quote or idea from the book (paraphrased if needed)"
    }
  ]
}

Rules:
- Suggest 3 books.
- If the user prefers novels, include at least one comforting or reflective novel (can be romance or fantasy).
- If they lean toward essays/psychology, include at least one non-fiction book.
- Avoid very technical textbooks. Focus on emotionally helpful, accessible works.
- Always keep a soft, friendly tone in the reasons.
- Respond with JSON only, no markdown, no explanatory prose.
`;
    }

    function renderRightIntro() {
      rightTop.innerHTML = `
        <div class="results-header">
          <h2>Quotes</h2>
          <span>Pick one that feels close to you.</span>
        </div>
        <p style="font-size:0.84rem; color:var(--text-sub); margin:2px 0 0 0;">
          First, we'll explore a few quotes together. When something resonates, I'll suggest books that match both your feelings and your reading taste.
        </p>
      `;
    }

    async function startQuoteFlow() {
      addAssistantMessage(
        "Thanks. Before recommending books, I’d like to share a few gentle quotes that might offer a bit of comfort or perspective based on what you shared. Choose the one that feels closest to you — I’ll then suggest books that match both your emotions and the quote."
      );
      renderLoadingRight("Preparing quotes for you…");

      try {
        const json = await callGeminiJSON(buildQuotePrompt());
        if (!json || !json.quotes || !json.quotes.length) {
          throw new Error("No quotes field in JSON.");
        }
        state.quotes = json.quotes;
        state.currentQuoteIndex = 0;
        renderCurrentQuote();
      } catch (e) {
        console.error(e);
        renderErrorRight(
          "I couldn’t finish preparing the quotes. Please try refreshing the page.",
          e
        );
      }
    }

    function renderLoadingRight(message) {
      rightTop.innerHTML = `
        <div class="results-header">
          <h2>Quotes</h2>
          <span>Loading…</span>
        </div>
        <div class="loading-row">
          <div class="spinner"></div>
          <div>${message}</div>
        </div>
      `;
    }

    function renderErrorRight(msg, err) {
      rightTop.innerHTML = `
        <div class="results-header">
          <h2>Quotes</h2>
          <span>Something went wrong</span>
        </div>
        <p style="font-size:0.85rem; color:var(--danger); margin-top:4px;">
          ${msg}
        </p>
      `;
      if (err) console.error(err);
    }

    async function renderCurrentQuote() {
      const q = state.quotes[state.currentQuoteIndex];
      if (!q) return;

      rightTop.innerHTML = `
        <div class="results-header">
          <h2>Quotes</h2>
          <span>Pick one that feels close to you.</span>
        </div>
      `;

      const card = document.createElement("div");
      card.className = "quote-card";

      const coverUrl = await fetchCoverForTitle(
        q.source_book_title || "",
        q.speaker || ""
      );

      card.innerHTML = `
        <div class="quote-card-body">
          <img class="quote-cover"
               src="${coverUrl}"
               alt="${
                 q.source_book_title
                   ? "Cover of " + q.source_book_title
                   : "Book cover"
               }"
               onerror="this.onerror=null;this.src='${OPENLIB_PLACEHOLDER}';" />
          <div class="quote-main">
            <div class="quote-text">“${q.text}”</div>
            <div class="quote-meta">
              ${q.speaker ? "— " + q.speaker : ""}
              ${q.source_book_title ? " · " + q.source_book_title : ""}
              ${
                q.is_fictional_character
                  ? " · fictional character"
                  : ""
              }
            </div>
            <div class="quote-actions">
              <button class="primary">This resonates</button>
              <button>Show another</button>
            </div>
          </div>
        </div>
      `;

      rightTop.appendChild(card);

      const [likeBtn, skipBtn] = card.querySelectorAll("button");
      likeBtn.addEventListener("click", () => {
        state.selectedQuote = q;
        startBookRecommendation();
      });
      skipBtn.addEventListener("click", () => {
        if (state.quotes.length <= 1) return;
        state.currentQuoteIndex =
          (state.currentQuoteIndex + 1) % state.quotes.length;
        renderCurrentQuote();
      });
    }

    async function startBookRecommendation() {
      if (state.recommending) return;
      state.recommending = true;

      const previousBooks =
        state.recommendedBooks && state.recommendedBooks.length
          ? [...state.recommendedBooks]
          : [];

      showToast(
        "Got it. I’ll look for a few books that match this quote and you.",
        "info"
      );

      rightTop.innerHTML = `
        <div class="results-header">
          <h2>Quotes</h2>
          <span>Finding books…</span>
        </div>
        <div class="quote-card">
          <div class="loading-row">
            <div class="spinner"></div>
            <div>Searching for books that fit your feelings and this quote…</div>
          </div>
        </div>
      `;

      try {
        const json = await callGeminiJSON(
          buildBookPrompt(state.selectedQuote)
        );
        const books = json && json.books ? json.books : [];
        state.recommendedBooks = books;
        renderBooksWithQuote(state.selectedQuote, books);
      } catch (e) {
        console.error(e);
        if (previousBooks.length) {
          // ② 더 보기에서 실패해도 이전 추천을 유지
          showToast(
            "I couldn’t fetch more books just now. I’ll keep the previous suggestions.",
            "error"
          );
          renderBooksWithQuote(state.selectedQuote, previousBooks);
        } else {
          renderErrorRight(
            "I couldn’t finish the recommendation. Please refresh and try again.",
            e
          );
        }
      } finally {
        state.recommending = false;
      }
    }

    async function renderBooksWithQuote(quote, books) {
      rightTop.innerHTML = `
        <div class="results-header">
          <h2>Recommended reads</h2>
          <span>Based on what you shared.</span>
        </div>
      `;

      const quoteCard = document.createElement("div");
      quoteCard.className = "quote-card";
      quoteCard.innerHTML = `
        <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-sub); margin-bottom:4px;">
          The quote you chose
        </div>
        <div class="quote-text" style="margin-bottom:4px;">“${quote.text}”</div>
        <div class="quote-meta">
          ${quote.speaker ? "— " + quote.speaker : ""}
          ${quote.source_book_title ? " · " + quote.source_book_title : ""}
        </div>
      `;
      rightTop.appendChild(quoteCard);

      const title = document.createElement("div");
      title.className = "sub-section-title";
      title.textContent = "Books I think could sit beside you right now";
      rightTop.appendChild(title);

      const list = document.createElement("div");
      list.className = "book-list";

      for (const b of books || []) {
        const coverUrl = await fetchCoverForTitle(
          b.title || "",
          b.author || ""
        );

        const card = document.createElement("div");
        card.className = "book-card";
        card.innerHTML = `
          <div class="book-card-inner">
            <img class="book-cover"
                 src="${coverUrl}"
                 alt="${b.title ? "Cover of " + b.title : "Book cover"}"
                 onerror="this.onerror=null;this.src='${OPENLIB_PLACEHOLDER}';" />
            <div class="book-info">
              <div class="book-card-title">${
                b.title || "Untitled book"
              }</div>
              <div class="book-meta">
                ${b.author || "Unknown author"}
                ${
                  typeof b.is_fiction === "boolean"
                    ? b.is_fiction
                      ? " · non-fiction" === false
                      : " · non-fiction"
                    : ""
                }
              </div>
              <div class="book-note">${b.reason || ""}</div>
              ${
                b.key_line
                  ? `<div class="book-line">“${b.key_line}”</div>`
                  : ""
              }
            </div>
          </div>
        `;
        list.appendChild(card);
      }

      if (!books || !books.length) {
        const empty = document.createElement("p");
        empty.style.fontSize = "0.84rem";
        empty.style.color = "var(--text-sub)";
        empty.textContent =
          "I couldn’t safely generate specific book titles. You can still take the quote with you as a small companion.";
        list.appendChild(empty);
      }

      rightTop.appendChild(list);

      // ③ 더 많은 책 둘러보기 버튼
      const moreRow = document.createElement("div");
      moreRow.className = "more-books-row";
      moreRow.innerHTML = `
        <button class="more-books-btn">See more books like these</button>
      `;
      const btn = moreRow.querySelector("button");
      btn.addEventListener("click", () => startBookRecommendation());
      rightTop.appendChild(moreRow);
    }

    // =============== RESET / RESTART ======================
    function resetConversation() {
      state.step = 0;
      state.feelings = [];
      state.triggers = [];
      state.bookKinds = [];
      state.extraNote = "";
      state.quotes = [];
      state.currentQuoteIndex = 0;
      state.selectedQuote = null;
      state.recommending = false;
      state.recommendedBooks = [];

      chatWindow.innerHTML = "";
      addAssistantMessage(
        "Hello, I’m glad you’re here. Let’s gently find a book that can keep you company."
      );

      chipRow.style.display = "flex";
      textInput.disabled = false;
      sendButton.disabled = false;

      renderRightIntro();
      setupStep();
    }

    restartButton.addEventListener("click", resetConversation);

    // =============== INIT ======================
    window.addEventListener("load", () => {
      addAssistantMessage(
        "Hello, I’m glad you’re here. Let’s gently find a book that can keep you company."
      );
      renderRightIntro();
      setupStep();
    });
