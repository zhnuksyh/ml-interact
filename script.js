// --- 1. CORE DATA & UTILITIES ---

// Vocabulary for embedding simulation (6 dimensions)
const vocab = {
    "fruit": [0.9, 0.1, 0.8, 0.2, 0.0, 0.5],
    "tech": [0.1, 0.9, 0.1, 0.8, 0.9, 0.2],
    "animal": [0.8, 0.1, 0.9, 0.1, 0.2, 0.6],
    "apple": [0.95, 0.2, 0.7, 0.3, 0.1, 0.4],
    "server": [0.1, 0.95, 0.1, 0.9, 0.8, 0.1],
    "cat": [0.85, 0.1, 0.95, 0.2, 0.3, 0.7],
    "banana": [0.9, 0.1, 0.7, 0.2, 0.1, 0.5],
    "code": [0.1, 0.9, 0.1, 0.9, 0.9, 0.1],
    "dog": [0.8, 0.1, 0.9, 0.1, 0.4, 0.6],
    "default": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
};

// Bigram model for next-token prediction
const bigram = {
    "the": ["quick", "artificial", "future", "data"],
    "artificial": ["intelligence", "neural", "reality"],
    "hello": ["world", "user", "there"],
    "data": ["base", "science", "privacy"],
    "quick": ["brown", "response", "fix"],
    "brown": ["fox", "box", "note"]
};

// Knowledge Base for RAG
const ragDB = [
    { id: 1, text: "To turn on, press button for 3s.", tags: ["turn", "on", "button", "power"] },
    { id: 2, text: "Battery lasts 24 hours on eco mode.", tags: ["battery", "life", "hours", "eco"] },
    { id: 3, text: "Lunch is served at 12:00 PM.", tags: ["lunch", "food", "time"] },
    { id: 4, text: "Warning: Do not submerge in water.", tags: ["water", "warning", "danger"] }
];

// Utility: Generate fake embedding for unknown words
function getEmbedding(word) {
    word = word.toLowerCase();
    if (vocab[word]) return vocab[word];
    // Deterministic hash based on character codes to generate 6 dimensions
    let val = 0; for (let i = 0; i < word.length; i++) val += word.charCodeAt(i);
    return [
        (val % 100) / 100,
        ((val * 2) % 100) / 100,
        ((val * 3) % 100) / 100,
        ((val * 4) % 100) / 100,
        ((val * 5) % 100) / 100,
        ((val * 6) % 100) / 100
    ];
}

// --- 2. GLOBAL NAVIGATION LOGIC ---
function switchTab(id) {
    // Hide all content modules
    document.querySelectorAll('[id^="content-"]').forEach(el => el.classList.add('hidden'));

    // Reset sidebar active states
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('active', 'text-blue-400');
        el.classList.add('text-slate-400');
    });

    // Show selected module and highlight button
    document.getElementById('content-' + id).classList.remove('hidden');
    document.getElementById('nav-' + id).classList.add('active', 'text-blue-400');
    document.getElementById('nav-' + id).classList.remove('text-slate-400');

    // Update Header Title
    document.getElementById('page-title').innerHTML = document.getElementById('nav-' + id).innerText;

    // Initialize specific modules if needed
    if (id === 'quantization') updateQuantization(document.getElementById('quant-slider').value);
    if (id === 'ocr') updateDocVisual();
    if (id === 'rag') renderKB();
}

// --- 3. PIPELINE WIZARD LOGIC ---
let step = 0;

function updateSteps() {
    // Manage wizard visibility
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('step-' + step).classList.remove('hidden');

    // Update progress bar dots
    for (let i = 0; i <= 5; i++) {
        const dot = document.getElementById('dot-' + i);
        if (i <= step) { dot.classList.add('active'); dot.style.background = '#3b82f6'; }
        else { dot.classList.remove('active'); dot.style.background = '#334155'; }
    }

    // Initialize step-specific visualizers
    if (step === 1) { updateChunking(); updateTokenization(); }
    if (step === 2) updateEmbedding();
    if (step === 3) initVectorDrag();
    if (step === 4) runPipelinePred();
    // Step 5 is static visualization for now, but could be dynamic
}

function nextStep() { if (step < 5) { step++; updateSteps(); } }
function prevStep() { if (step > 0) { step--; updateSteps(); } }
function resetPipeline() { step = 0; updateSteps(); }

// Pipeline Step 1: Chunking Visualization
function updateChunking() {
    const size = parseInt(document.getElementById('chunk-slider').value);
    const overlap = parseInt(document.getElementById('overlap-slider').value);

    // Ensure overlap is less than size
    if (overlap >= size) {
        document.getElementById('overlap-slider').value = size - 1;
        return updateChunking();
    }

    const text = document.getElementById('chunk-input').value;
    document.getElementById('chunk-val').innerText = size + " chars";
    document.getElementById('overlap-val').innerText = overlap + " chars";

    let html = '', c = 0;
    // Overlap logic: step by (size - overlap)
    const stepSize = size - overlap;

    for (let i = 0; i < text.length; i += stepSize) {
        let chunkText = text.substring(i, i + size);
        if (chunkText.length < size && i > 0) break; // Avoid tiny tail chunks if desired, or keep them

        // Wrap each chunk in a span with alternating colors
        html += `<span class="chunk-span chunk-${c % 4}" title="Chunk ${c + 1}">${chunkText}</span>`;
        c++;
    }
    document.getElementById('chunk-display').innerHTML = html;

    // Also update tokenization when text changes
    updateTokenization();
}

function updateTokenization() {
    const text = document.getElementById('chunk-input').value;
    const model = document.getElementById('tokenizer-model').value;
    const display = document.getElementById('token-display');
    const countEl = document.getElementById('token-count');
    const costEl = document.getElementById('token-cost');

    // Model Data (Approximate)
    const models = {
        'gpt4o': { name: 'GPT-4o', in: 5.00, out: 15.00, ctx: '128k', color: 'bg-green-900/50 text-green-200' },
        'claude35': { name: 'Claude 3.5', in: 3.00, out: 15.00, ctx: '200k', color: 'bg-orange-900/50 text-orange-200' },
        'gemini15': { name: 'Gemini 1.5', in: 3.50, out: 10.50, ctx: '1M+', color: 'bg-blue-900/50 text-blue-200' },
        'ollama': { name: 'Llama 3', in: 0, out: 0, ctx: '8k', color: 'bg-slate-700 text-slate-200' }
    };

    const info = models[model];
    document.getElementById('token-window').innerText = info.ctx;
    document.getElementById('cost-input').innerText = `$${info.in.toFixed(2)}/1M`;
    document.getElementById('cost-output').innerText = `$${info.out.toFixed(2)}/1M`;

    let tokens = [];

    // Simulation of different tokenizers
    if (model === 'gpt4o' || model === 'claude35' || model === 'gemini15') {
        // Standard BPE-like behavior for commercial models
        // Heuristic: Split by space and punctuation, keep punctuation separate
        tokens = text.match(/[\w]+|[^\s\w]/g) || [];
    } else {
        // Llama/Open Source style
        tokens = text.split(/(\s+)/).filter(x => x).map(t => t.replace(' ', ' '));
        tokens.unshift("<s>");
    }

    // Render tokens
    let html = '';
    tokens.forEach((t, i) => {
        let colorClass = i % 2 === 0 ? info.color : 'bg-opacity-50 opacity-70 border-white/5';
        // Special tokens
        if (t.startsWith('<')) colorClass = 'bg-yellow-900/50 text-yellow-200 font-bold';

        // Use the model's base color but alternate opacity/shade
        if (i % 2 !== 0) colorClass = info.color.replace('bg-', 'bg-black/20 border-').replace('text-', 'text-opacity-80 text-');

        html += `<span class="px-1 rounded border border-white/10 ${colorClass} inline-block mb-1">${t.replace(' ', '&nbsp;')}</span>`;
    });

    display.innerHTML = html;
    countEl.innerText = tokens.length;

    // Calculate Cost (Input only for this view)
    const cost = (tokens.length / 1000000) * info.in;
    costEl.innerText = `$${cost.toFixed(6)}`;
}

// Pipeline Step 2: Embedding Bars
function updateEmbedding() {
    const word = document.getElementById('embed-input').value;
    const vec = getEmbedding(word);
    const labels = ["Organic", "Tech", "Intensity", "Abstract", "Physical", "Emotion"];

    const container = document.getElementById('vector-values');
    container.innerHTML = vec.map((v, i) => `
        <div class="bg-slate-900 p-2 rounded border border-slate-700 text-center">
            <div class="text-[9px] text-slate-500 mb-1 uppercase tracking-wider">${labels[i]}</div>
            <div class="font-mono text-blue-400 font-bold text-xs">${v.toFixed(3)}</div>
        </div>
    `).join('');

    document.getElementById('vector-output').innerText = `[${vec.map(v => v.toFixed(3)).join(', ')}]`;
}

// Pipeline Step 3: Vector Dragging Logic
function initVectorDrag() {
    const space = document.getElementById('vector-space');
    const node = document.getElementById('query-node');
    const line = document.getElementById('nearest-line');
    const label = document.getElementById('nearest-label');
    const distLabel = document.getElementById('nearest-dist');
    const ptsContainer = document.getElementById('knowledge-points-container');

    // Define static knowledge points
    const points = [
        { x: 0.2, y: 0.2, n: 'Banana', c: 'Organic' }, { x: 0.8, y: 0.8, n: 'Laptop', c: 'Tech' }, { x: 0.5, y: 0.5, n: 'Table', c: 'Object' },
        { x: 0.3, y: 0.8, n: 'Phone', c: 'Tech' }, { x: 0.7, y: 0.2, n: 'Apple', c: 'Organic' }, { x: 0.9, y: 0.4, n: 'Server', c: 'Tech' }
    ];

    // Render static points
    ptsContainer.innerHTML = points.map(p =>
        `<div class="vector-point bg-slate-500" style="top:${p.y * 100}%;left:${p.x * 100}%"><span class="vector-label">${p.n}</span></div>`
    ).join('');

    // Handle Mouse Move for Distance Calculation
    space.onmousemove = (e) => {
        if (e.buttons !== 1) return; // Only drag when clicked
        const rect = space.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Move query node
        node.style.left = x + 'px';
        node.style.top = y + 'px';

        // Calculate Euclidean Distance to all points
        let min = Infinity, best = null;
        points.forEach(p => {
            const px = p.x * rect.width; const py = p.y * rect.height;
            const d = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
            if (d < min) { min = d; best = p; }
        });

        // Update Visuals
        if (best) {
            line.setAttribute('x1', x); line.setAttribute('y1', y);
            line.setAttribute('x2', best.x * rect.width); line.setAttribute('y2', best.y * rect.height);
            label.innerText = best.n;

            // Highlight if close enough
            if (min < 100) {
                label.style.color = '#4ade80'; // Green
                line.setAttribute('stroke', '#4ade80');
                // Save state for Step 4
                localStorage.setItem('pipeline-match', best.n);
                localStorage.setItem('pipeline-cat', best.c);
            } else {
                label.style.color = 'white';
                line.setAttribute('stroke', '#3b82f6'); // Blue
            }
            distLabel.innerText = "Distance: " + Math.round(min);
        }
    };
}

// Pipeline Step 4: Final Output Generation
function runPipelinePred() {
    const match = localStorage.getItem('pipeline-match') || "Nothing";
    const cat = localStorage.getItem('pipeline-cat') || "Unknown";

    document.getElementById('pipeline-query').innerText = `What is a ${match}?`;

    // Simulate RAG Context Retrieval
    // We show multiple "retrieved" chunks, but only one is highly relevant
    const contexts = [
        { text: `${match} belongs to category ${cat}.`, rel: "High" },
        { text: "The weather in Mars is dusty today.", rel: "Low" },
        { text: "System error: 404 not found.", rel: "Low" }
    ];

    let contextHtml = '';
    contexts.forEach(c => {
        const color = c.rel === "High" ? "text-green-400 border-green-900" : "text-slate-600 border-slate-800 opacity-50";
        contextHtml += `<div class="border p-2 rounded mb-1 ${color} text-[10px]">
            <span class="font-bold">[${c.rel} Relevance]</span> ${c.text}
        </div>`;
    });

    document.getElementById('pipeline-context').innerHTML = contextHtml;
    document.getElementById('pipeline-output').innerText = `Based on the context provided, a ${match} is categorized as ${cat}.`;
    document.getElementById('pipeline-note').innerText = "Note: The model focused on the 'High Relevance' context and ignored the others.";
}

// --- 4. QUANTIZATION LAB LOGIC ---
function updateQuantization(val) {
    val = parseInt(val); // 0=FP32, 1=FP16, 2=INT8, 3=INT4
    const grid = document.getElementById('weight-matrix');
    const hwMsg = document.getElementById('q-hw');
    let html = '';

    // Sample Neural Weights (Random distribution)
    const weights = [0.12345678, -0.98765432, 0.55555555, -0.11111111, 0.00000001, 0.88888888, -0.44444444, 0.33333333, 0.77777777, -0.22222222, 0.66666666, -0.55555555];

    // Loop through weights and round them based on selected precision
    weights.forEach(w => {
        let disp = '', bg = '', txt = '';
        if (val === 0) { // FP32 (Original)
            disp = w.toFixed(8); bg = '#1e293b'; txt = '#94a3b8';
        } else if (val === 1) { // FP16 (Truncated)
            disp = w.toFixed(4); bg = '#1e1b4b'; txt = '#818cf8';
        } else if (val === 2) { // INT8 (Quantized)
            disp = (Math.round(w * 127) / 127).toFixed(2); bg = '#172554'; txt = '#60a5fa';
        } else { // INT4 (Highly Compressed)
            disp = w > 0 ? '1' : '0'; bg = '#450a0a'; txt = '#fca5a5';
        }
        html += `<div class="matrix-cell" style="background:${bg}; color:${txt};">${disp}</div>`;
    });
    grid.innerHTML = html;

    // Update Stats Display
    const stats = [
        { sz: "28 GB", ram: "32 GB", loss: "0%", col: "text-green-400", hw: "Server GPU (A100)" },
        { sz: "14 GB", ram: "16 GB", loss: "0.01%", col: "text-green-300", hw: "Desktop GPU (RTX 4090)" },
        { sz: "7 GB", ram: "8 GB", loss: "0.5%", col: "text-yellow-400", hw: "Laptop (MacBook M1)" },
        { sz: "3.5 GB", ram: "4 GB", loss: "3-5%", col: "text-red-400", hw: "Phone (iPhone 15)" }
    ];

    document.getElementById('q-size').innerText = stats[val].sz;
    document.getElementById('q-ram').innerText = stats[val].ram;
    document.getElementById('q-loss').innerText = stats[val].loss;
    document.getElementById('q-loss').className = `text-2xl font-bold ${stats[val].col}`;
    hwMsg.innerText = stats[val].hw;
}

// --- 5. LLM BASICS LOGIC ---
function runLLM() {
    const input = document.getElementById('llm-input').value.toLowerCase().trim().split(' ').pop();
    const bars = document.getElementById('llm-bars');
    bars.innerHTML = `<div class="text-blue-400 animate-pulse">Calculating...</div>`;

    setTimeout(() => {
        // Fetch next-word candidates from bigram model
        const candidates = bigram[input] || ["is", "the", "a", "unknown"];
        const probs = candidates.map(w => ({ w, p: Math.floor(Math.random() * 80) }));
        probs.sort((a, b) => b.p - a.p); // Sort by probability

        const total = probs.reduce((s, i) => s + i.p, 0); // Calculate total for %

        // Render progress bars
        bars.innerHTML = probs.map(i => {
            const pct = Math.floor((i.p / total) * 100);
            return `
                    <div class="flex items-center gap-2 text-xs">
                        <span class="w-16 text-right text-slate-400">"${i.w}"</span>
                        <div class="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden"><div class="bg-blue-600 h-full" style="width:${pct}%"></div></div>
                        <span class="w-8 text-white">${pct}%</span>
                    </div>`;
        }).join('');

        // Apply Temperature logic (Selection)
        const temp = parseFloat(document.getElementById('llm-temp').value);
        const idx = temp < 0.5 ? 0 : Math.floor(Math.random() * probs.length); // Low temp = top choice, High temp = random
        document.getElementById('llm-selected').innerText = `Selected: "${probs[idx].w}"`;
    }, 500);
}

// --- 6. INFERENCE SIMULATION LOGIC ---
function runInference() {
    const engine = document.querySelector('input[name="engine"]:checked').value;
    const consoleEl = document.getElementById('inf-console');
    consoleEl.innerHTML = "";

    // Set speed based on engine choice
    let speed = 10;
    if (engine === 'llama') speed = 40;
    if (engine === 'vllm') speed = 100;

    const generated = `Here is a poem about space coding:\n\nStars align in binary code,\nA cosmic script, a silent mode.\nWhile neurons fire in silicone,\nWe build new worlds, purely known.\n\n(Generated by ${engine})`;
    const chars = generated.split('');
    let i = 0;

    // Typing animation loop
    const interval = setInterval(() => {
        if (i >= chars.length) {
            clearInterval(interval);
            document.getElementById('inf-speed').innerText = speed + " char/s";
            document.getElementById('inf-time').innerText = (chars.length / speed).toFixed(2) + "s";
        } else {
            consoleEl.innerHTML += chars[i];
            i++;
            consoleEl.scrollTop = consoleEl.scrollHeight; // Auto-scroll
        }
    }, 1000 / speed);
}

// --- 7. OCR SIMULATION LOGIC ---
function updateDocVisual() {
    const type = document.getElementById('doc-selector').value;
    const visual = document.getElementById('doc-visual');
    // Render different HTML content based on selection
    if (type === 'invoice') visual.innerHTML = `<h3 class="font-bold border-b border-black">INVOICE #99</h3><p>Item: Jetpack</p><p>Cost: $9000</p>`;
    else if (type === 'idcard') visual.innerHTML = `<div class="bg-blue-100 p-1 font-bold">ID</div><p>Name: Alice</p><p>Role: Pilot</p>`;
    else visual.innerHTML = `<div class="font-[cursive] text-lg">Don't forget<br>to feed the<br>AI model!</div>`;
}

function runOCR() {
    const mode = document.getElementById('ocr-mode').value;
    const htmlContent = document.getElementById('doc-visual').innerText;
    const out = document.getElementById('ocr-output');
    out.innerText = "Scanning DOM...";

    setTimeout(() => {
        if (mode === 'legacy') {
            // Legacy OCR just returns messy string
            out.innerText = htmlContent;
            out.style.color = "#fca5a5";
        } else {
            // Vision Model returns structured JSON
            const lines = htmlContent.split('\n').filter(x => x);
            const obj = { type: document.getElementById('doc-selector').value, content: lines };
            out.innerText = JSON.stringify(obj, null, 2);
            out.style.color = "#4ade80";
        }
    }, 800);
}

// --- 8. RAG LOGIC ---
function renderKB() {
    // Render the database items
    document.getElementById('kb-list').innerHTML = ragDB.map(i =>
        `<div class="bg-slate-800 p-2 rounded text-xs text-slate-300 border border-slate-700 mb-2">
                    <span class="text-blue-400 font-bold">[${i.id}]</span> ${i.text}
                 </div>`
    ).join('');
}

function runRAGSearch() {
    const query = document.getElementById('rag-query-input').value.toLowerCase();
    let best = null, maxScore = 0;

    // Simple Keyword Overlap Search
    ragDB.forEach(chunk => {
        let score = 0;
        chunk.tags.forEach(tag => { if (query.includes(tag)) score++; });
        if (score > maxScore) { maxScore = score; best = chunk; }
    });

    const ctx = document.getElementById('rag-context');
    if (best && maxScore > 0) {
        ctx.innerHTML = `<span class="text-green-400">MATCH FOUND (Score ${maxScore}):</span>\n"${best.text}"`;
        localStorage.setItem('rag-best', best.text);

        // Enable Generation Button
        const btn = document.getElementById('rag-gen-btn');
        btn.disabled = false;
        btn.classList.replace('bg-slate-700', 'btn-primary');
        btn.classList.replace('text-slate-400', 'text-white');
    } else {
        ctx.innerHTML = `<span class="text-red-400">NO MATCH FOUND.</span>`;
    }
}

function runRAGGen() {
    const context = localStorage.getItem('rag-best');
    const ctx = document.getElementById('rag-context');
    ctx.innerHTML += `\n\n<span class="text-blue-400">AI ANSWER:</span> Based on the manual, ${context}`;
}

// --- 9. MCP (TOOL USE) LOGIC ---
function runMCP() {
    const input = document.getElementById('mcp-input').value.toLowerCase();
    document.getElementById('mcp-1').classList.remove('opacity-0');

    // Heuristic Router
    let tool = "none", result = "I don't understand.";
    if (input.includes('weather')) { tool = "get_weather('London')"; result = "Temp: 15°C, Rain: None"; }
    else if (input.includes('email')) { tool = "send_email('Admin')"; result = "Email sent successfully."; }
    else if (input.includes('db') || input.includes('user')) { tool = "query_db('SELECT *')"; result = "User found: ID 101"; }

    document.getElementById('mcp-thought').innerText = tool !== "none" ? "Identified tool needed." : "No tool needed.";

    // Step 2: Execute Tool
    setTimeout(() => {
        document.getElementById('mcp-2').classList.remove('opacity-0');
        document.getElementById('mcp-tool').innerText = tool;
    }, 800);

    // Step 3: Final Answer
    setTimeout(() => {
        document.getElementById('mcp-3').classList.remove('opacity-0');
        document.getElementById('mcp-final').innerText = result;
    }, 1600);
}

// --- 10. PROMPT ENGINEERING LOGIC ---
let personaPrompt = "";
function setPersona(p) {
    const map = {
        assistant: "You are a helpful assistant.",
        pirate: "You are a pirate. Arrr!",
        robot: "Output only JSON.",
        therapy: "I am here to listen. How does that feel?"
    };
    personaPrompt = map[p];
    document.getElementById('sys-prompt').innerText = `"${personaPrompt}"`;
    document.getElementById('chat-history').innerHTML = `<div class="text-center text-xs text-slate-500 italic">System Prompt Updated</div>`;
}

function sendChat() {
    const val = document.getElementById('chat-input').value;
    const hist = document.getElementById('chat-history');
    hist.innerHTML += `<div class="text-right text-white bg-blue-600 p-2 rounded-lg self-end mb-2 text-xs ml-auto max-w-[80%]">${val}</div>`;

    setTimeout(() => {
        let resp = "I can help.";
        // Conditional responses based on persona string check
        if (personaPrompt.includes("pirate")) resp = "Aye matey! That be a fine thing to say.";
        if (personaPrompt.includes("JSON")) resp = `{"user_input": "${val}", "status": "received"}`;
        if (personaPrompt.includes("listen")) resp = "I hear you. Tell me more about why you said that.";

        hist.innerHTML += `<div class="text-left text-slate-300 bg-slate-800 p-2 rounded-lg self-start mb-2 text-xs max-w-[80%]">${resp}</div>`;
        hist.scrollTop = hist.scrollHeight;
    }, 600);
}

// --- 11. INFRASTRUCTURE LOGIC ---
function runPing() {
    // Local is always instant
    document.getElementById('lat-local').innerText = "< 1 ms";
    // Cloud has random latency
    document.getElementById('lat-cloud').innerText = (Math.floor(Math.random() * 50) + 100) + " ms";

    document.getElementById('lat-local').classList.add('text-green-400');
    document.getElementById('lat-cloud').classList.add('text-yellow-400');
}

// --- INITIALIZATION ---
// Run startup routines to populate UI
updateChunking();
updateEmbedding();
updateDocVisual();
initVectorDrag();
setPersona('assistant');
