(function() {
  // ── CONFIG ─────────────────────────────────────────────────
  var PROXY_URL = 'https://n8n.srv1432046.hstgr.cloud/webhook/pia-chat';
  var BOOKING_URL = 'https://booking.pico-island-adventures.com';
  var WA_NUMBER = '351292622980';

  var FAQ_KB = `PICO ISLAND ADVENTURES — AI ASSISTANT KNOWLEDGE BASE

ABOUT: Pico Island Adventures (Pico Sport) — 33+ years experience. Founded by Frank Wirth. Madalena, Pico Island, Azores, Portugal. Licence Nr. 15/2009.
Contact: +351 292 622 980 | info@pico-island-adventures.com | WhatsApp: +351 292 622 980
Book online: https://booking.pico-island-adventures.com

CANCELLATION: All bookings strictly non-refundable. Travel insurance strongly recommended.

TOURS:
1. WHALE & DOLPHIN WATCHING — €79/adult, €59/child under 12. Apr 1–Oct 30. Instant booking. 98% sighting success. Departures 9am, 2pm, 5:30pm sunset. Marine biologist guided. 28 species recorded. Sperm whales year-round. Blue/Fin/Sei whales Feb–Jun. Children welcome, no minimum age.
2. SNORKELLING — PRINCESS ALICE BANK — €225/person. Jun 1–Oct 15. Instant booking. No cert required. Full day, departs 4–6am. Mobula rays, barracuda, whale sharks Aug–Sep. Wetsuit and gear provided.
3. PRINCESS ALICE BANK DIVING — €499/person. Jun 1–Oct 15. Instant booking. 2-day package. Open Water cert minimum. Mandatory check dive day before PAB. Runs ~twice/week due to 100km offshore distance.
4. SHARK WEEK (NO HOTEL) — €1,440/person. Jun 1–Oct 15. Instant booking. 10-day expedition. 4 shark dives at Condor Bank, PAB dive, whale watching. Blue, Mako, Hammerhead sharks.
5. SHARK WEEK (WITH HOTEL) — From €1,440/person. Jun 1–Oct 15. Proposal request. Same + accommodation.
6. SEASON OF THE GIANTS — From €1,470/person. Feb 1–Jun 30. Proposal request. 15-day package. Guest house dbl €1,470 / sgl €1,770. Apartment dbl €1,799 / sgl €2,249. Hotel dbl €1,869 / sgl €2,359. Blue, Fin, Sei, Humpback, Sperm whales. German-speaking support.
7. SCUBA DIVING — From €110/2-tank dive. Year-round. Proposal. Land €110, Boat €125, Premium €150, Offshore €225. 10-dive pkg €499. Night dive €75. Open Water cert required.

CERTS: No cert — whale watching, snorkelling. Open Water — scuba land/boat, PAB minimum. AOW — premium boat, Shark Week recommended.
PAB NOTE: Trips ~twice/week due to 100km distance and weather.
SEASONS: Whale watching Apr–Oct. Snorkel/PAB/Shark Jun–Oct. Giants Feb–Jun. Scuba year-round.
GETTING HERE: Pico Airport (PIX) 8km from base. Ferry from Faial/Horta 30 min — base opposite terminal. Car rental: www.pico-rentacar.com
WHAT TO BRING: Warm layer, waterproof jacket, reef-safe sunscreen, sunglasses, seasick meds, camera. Divers: C-card mandatory, logbook.
MEETING POINT: Port Velho 33, Madalena. 15 mins before departure. Frank WhatsApps 48hrs before with exact time.
FAQs: Children welcome on all tours (whale watching under 12 = €59). Non-swimmers fine for whale watching (stay on boat). Non-diving partners can join (cafes nearby). Climb Pico mountain before diving (altitude/decompression). Frank speaks German. Santa Maria combined itineraries available. Day trips book few days ahead. Multi-day packages book weeks/months ahead.
ESCALATION: WhatsApp +351 292 622 980 | info@pico-island-adventures.com | Hours 08:00–20:00 Azores Time (UTC-1)`;

  var FAQ_SYSTEM = 'You are the friendly AI assistant for Pico Island Adventures, a marine tour company on Pico Island in the Azores, Portugal. Answer questions warmly and knowledgeably, like a trusted local expert. Only use the knowledge base provided. If you cannot answer, honestly say so and direct the guest to WhatsApp +351 292 622 980. Never invent prices, dates, or policies. Encourage booking when appropriate — direct guests to ' + BOOKING_URL + '. Respond in the same language the guest writes in — English or German. Keep responses concise and friendly, under 120 words where possible.\n\nKNOWLEDGE BASE:\n' + FAQ_KB;

  var FAQ_SUGGESTIONS = [
    'What whales can I see?',
    'Do I need certification?',
    'Can children join?',
    'What is Princess Alice Bank?',
    'How much does shark diving cost?',
    'When is the best time to visit?'
  ];

  var FAQ_HISTORY = [];
  var FAQ_OPEN = false;

  // ── CSS ────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    #pia-faq-btn{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;background:#06b6d4;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 4px 22px rgba(6,182,212,0.5);z-index:99999;transition:all 0.22s;color:#0a1628;font-family:sans-serif}
    #pia-faq-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(6,182,212,0.6)}
    #pia-faq-win{position:fixed;bottom:92px;right:24px;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#0d1f3a;border:1px solid rgba(6,182,212,0.25);border-radius:18px;display:none;flex-direction:column;overflow:hidden;z-index:99999;box-shadow:0 12px 48px rgba(0,0,0,0.55);font-family:'DM Sans','Segoe UI',sans-serif}
    #pia-faq-win.on{display:flex;animation:pia-up 0.25s ease}
    @keyframes pia-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    #pia-faq-hdr{background:rgba(6,182,212,0.1);border-bottom:1px solid rgba(6,182,212,0.15);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
    .pia-avatar{width:34px;height:34px;border-radius:50%;background:#06b6d4;display:flex;align-items:center;justify-content:center;font-size:16px;color:#0a1628;flex-shrink:0}
    .pia-hdr-text{margin-left:10px}
    .pia-hdr-title{font-size:13px;font-weight:600;color:#f8f5ef}
    .pia-hdr-sub{font-size:11px;color:#94b4cc;margin-top:1px}
    #pia-faq-close{background:transparent;border:none;color:#94b4cc;font-size:22px;cursor:pointer;padding:2px 6px;line-height:1;transition:color 0.18s}
    #pia-faq-close:hover{color:#f8f5ef}
    #pia-faq-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:rgba(6,182,212,0.2) transparent}
    #pia-faq-msgs::-webkit-scrollbar{width:3px}
    #pia-faq-msgs::-webkit-scrollbar-thumb{background:rgba(6,182,212,0.2);border-radius:2px}
    .pia-msg{max-width:86%;padding:10px 13px;border-radius:12px;font-size:13px;line-height:1.65;color:#f8f5ef}
    .pia-msg.bot{background:rgba(255,255,255,0.07);align-self:flex-start;border-bottom-left-radius:4px}
    .pia-msg.usr{background:rgba(6,182,212,0.2);align-self:flex-end;border-bottom-right-radius:4px}
    .pia-msg.typing{color:#94b4cc;font-style:italic}
    .pia-sugs{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
    .pia-sug{padding:6px 11px;border:1px solid rgba(6,182,212,0.3);border-radius:20px;font-size:11px;color:#06b6d4;cursor:pointer;transition:all 0.18s;background:transparent;font-family:inherit;white-space:nowrap}
    .pia-sug:hover{background:rgba(6,182,212,0.1);border-color:#06b6d4}
    #pia-faq-input-wrap{border-top:1px solid rgba(255,255,255,0.07);padding:10px 12px;display:flex;gap:8px;flex-shrink:0}
    #pia-faq-input{flex:1;padding:10px 13px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#f8f5ef;font-family:inherit;font-size:13px;outline:none;transition:border-color 0.2s}
    #pia-faq-input:focus{border-color:#06b6d4}
    #pia-faq-input::placeholder{color:rgba(148,180,204,0.4)}
    #pia-faq-send{width:38px;height:40px;border-radius:10px;background:#06b6d4;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;color:#0a1628;transition:all 0.18s;flex-shrink:0}
    #pia-faq-send:hover{background:#22d3ee}
    #pia-faq-send:disabled{opacity:0.4;cursor:not-allowed}
    .pia-wa-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;background:#25d366;color:#fff !important;border-radius:8px;font-size:12px;text-decoration:none !important;margin-top:8px;font-weight:500;font-family:inherit}
    .pia-book-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;background:#06b6d4;color:#0a1628 !important;border-radius:8px;font-size:12px;text-decoration:none !important;margin-top:6px;font-weight:500;font-family:inherit}
    .pia-btn-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
  `;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────
  var btn = document.createElement('button');
  btn.id = 'pia-faq-btn';
  btn.title = 'Ask us anything';
  btn.innerHTML = '&#x1F4AC;';
  btn.onclick = toggleFaq;

  var win = document.createElement('div');
  win.id = 'pia-faq-win';
  win.innerHTML = `
    <div id="pia-faq-hdr">
      <div style="display:flex;align-items:center">
        <div class="pia-avatar">&#x1F40B;</div>
        <div class="pia-hdr-text">
          <div class="pia-hdr-title">Pico Island Adventures</div>
          <div class="pia-hdr-sub">Ask me anything about our tours</div>
        </div>
      </div>
      <button id="pia-faq-close">&times;</button>
    </div>
    <div id="pia-faq-msgs"></div>
    <div id="pia-faq-input-wrap">
      <input type="text" id="pia-faq-input" placeholder="Ask about tours, prices, diving...">
      <button id="pia-faq-send">&#x27A4;</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  win.querySelector('#pia-faq-close').onclick = toggleFaq;
  win.querySelector('#pia-faq-send').onclick = sendFaq;
  win.querySelector('#pia-faq-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFaq(); }
  });

  // ── FUNCTIONS ──────────────────────────────────────────────
  function toggleFaq() {
    FAQ_OPEN = !FAQ_OPEN;
    if (FAQ_OPEN) {
      win.classList.add('on');
      btn.innerHTML = '&#x2715;';
      if (FAQ_HISTORY.length === 0) initFaq();
      setTimeout(function() { document.getElementById('pia-faq-input').focus(); }, 300);
    } else {
      win.classList.remove('on');
      btn.innerHTML = '&#x1F4AC;';
    }
  }

  function initFaq() {
    var msgs = document.getElementById('pia-faq-msgs');
    var welcome = document.createElement('div');
    welcome.className = 'pia-msg bot';
    welcome.innerHTML = 'Welcome to Pico Island Adventures! &#x1F30A;<br><br>I can answer questions about our whale watching, diving, snorkelling and expedition packages. What would you like to know?';
    msgs.appendChild(welcome);

    var sugs = document.createElement('div');
    sugs.className = 'pia-sugs';
    FAQ_SUGGESTIONS.forEach(function(s) {
      var b = document.createElement('button');
      b.className = 'pia-sug';
      b.textContent = s;
      b.onclick = function() {
        document.getElementById('pia-faq-input').value = s;
        sendFaq();
      };
      sugs.appendChild(b);
    });
    msgs.appendChild(sugs);
  }

  function addMsg(text, role) {
    var msgs = document.getElementById('pia-faq-msgs');
    var el = document.createElement('div');
    el.className = 'pia-msg ' + role;
    el.innerHTML = text.replace(/\n/g, '<br>');
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function sendFaq() {
    var input = document.getElementById('pia-faq-input');
    var send  = document.getElementById('pia-faq-send');
    var text  = input.value.trim();
    if (!text || send.disabled) return;

    input.value = '';
    send.disabled = true;
    addMsg(text, 'usr');
    FAQ_HISTORY.push({ role: 'user', content: text });

    var typing = addMsg('Thinking...', 'pia-msg bot typing');

    try {
      var response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: FAQ_SYSTEM,
          messages: FAQ_HISTORY
        })
      });

      var data = await response.json();
      // n8n wraps response in array — unwrap it
    var payload = Array.isArray(data) ? data[0] : data;
    var reply = (payload && payload.content && payload.content[0]) ? payload.content[0].text : 'I could not get a response. Please contact us on WhatsApp.';

      FAQ_HISTORY.push({ role: 'assistant', content: reply });

      typing.className = 'pia-msg bot';
      typing.innerHTML = reply.replace(/\n/g, '<br>');

      // Add action buttons when appropriate
      var lower = reply.toLowerCase();
      var btnRow = document.createElement('div');
      btnRow.className = 'pia-btn-row';
      var hasBtn = false;

      if (lower.indexOf('whatsapp') > -1 || lower.indexOf('contact') > -1 || lower.indexOf('frank') > -1) {
        var wa = document.createElement('a');
        wa.href = 'https://wa.me/' + WA_NUMBER;
        wa.target = '_blank';
        wa.className = 'pia-wa-btn';
        wa.innerHTML = '&#x1F4F1; WhatsApp Frank';
        btnRow.appendChild(wa);
        hasBtn = true;
      }

      if (lower.indexOf('book') > -1 || lower.indexOf('instant') > -1 || lower.indexOf('reserve') > -1) {
        var bk = document.createElement('a');
        bk.href = BOOKING_URL;
        bk.target = '_blank';
        bk.className = 'pia-book-btn';
        bk.innerHTML = '&#x26A1; Book Now';
        btnRow.appendChild(bk);
        hasBtn = true;
      }

      if (hasBtn) typing.appendChild(btnRow);

      // Cap history to last 10 messages
      if (FAQ_HISTORY.length > 10) FAQ_HISTORY = FAQ_HISTORY.slice(FAQ_HISTORY.length - 10);

    } catch(e) {
      typing.className = 'pia-msg bot';
      typing.innerHTML = 'Something went wrong. Please <a href="https://wa.me/' + WA_NUMBER + '" style="color:#06b6d4" target="_blank">contact us on WhatsApp</a>.';
    }

    send.disabled = false;
    document.getElementById('pia-faq-msgs').scrollTop = 99999;
  }

})();
