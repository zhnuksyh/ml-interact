// Semantic Vocabulary (6 dimensions)
// Dims: [Tech, Organic, Space, Abstract, Action, Positive]
export const vocab = {
    // Tech Cluster
    "computer": [0.9, 0.1, 0.2, 0.8, 0.5, 0.5],
    "server": [0.95, 0.1, 0.1, 0.7, 0.6, 0.5],
    "code": [0.8, 0.1, 0.3, 0.9, 0.7, 0.5],
    "linux": [0.9, 0.1, 0.1, 0.8, 0.5, 0.6],
    "ai": [0.9, 0.1, 0.4, 0.9, 0.8, 0.6],

    // Organic/Food Cluster
    "apple": [0.1, 0.9, 0.1, 0.1, 0.2, 0.7],
    "banana": [0.1, 0.95, 0.1, 0.1, 0.1, 0.8],
    "fruit": [0.1, 0.9, 0.1, 0.3, 0.1, 0.6],
    "lunch": [0.2, 0.8, 0.1, 0.4, 0.5, 0.9],

    // Space Cluster
    "star": [0.3, 0.1, 0.9, 0.6, 0.2, 0.8],
    "planet": [0.2, 0.4, 0.9, 0.5, 0.1, 0.7],
    "rocket": [0.8, 0.1, 0.9, 0.2, 0.9, 0.6],
    "mars": [0.4, 0.2, 0.95, 0.3, 0.1, 0.5],

    // General
    "king": [0.2, 0.6, 0.1, 0.5, 0.8, 0.7],
    "man": [0.2, 0.7, 0.1, 0.4, 0.6, 0.5],
    "woman": [0.2, 0.7, 0.1, 0.4, 0.6, 0.5],
    "queen": [0.2, 0.6, 0.1, 0.5, 0.8, 0.8],

    "default": [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
};

export const subwords = [
    "ing", "ed", "tion", "ness", "ment", "pre", "un", "re", "inter", "anti", "geo", "bio", "tech"
];

// Utility: Cosine Similarity
export function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) return 0;
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const snA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const snB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (snA === 0 || snB === 0) return 0;
    return dotProduct / (snA * snB);
}

// Utility: Semantic Embedding Generation
export function getEmbedding(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return vocab['default'];
    if (vocab[word]) return vocab[word];

    // Fallback: Check for similar known words
    for (let key in vocab) {
        if (word.includes(key) || key.includes(word)) {
            return vocab[key].map(v => v + (Math.random() * 0.1 - 0.05));
        }
    }

    // Deterministic hash 
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

// Utility: Mock BPE Tokenizer
export function tokenize(text, model = 'gpt4o') {
    let tokens = [];

    // Llama/Simple: Split by space + punctuation
    if (model === 'ollama') {
        tokens = text.split(/(\s+)/).filter(x => x).map(t => t.replace(' ', ' '));
        tokens.unshift("<s>");
        return tokens;
    }

    // Advanced: Mock BPE (Merge whitespace with next token)
    const rawParts = text.split(/(\s+)/);
    let buffer = "";

    rawParts.forEach((part, index) => {
        if (!part) return;

        // If it's whitespace, add to buffer and continue
        if (!part.trim()) {
            buffer += part;
            return;
        }

        // It's a word/text. Prepend buffer (whitespace) to it.
        let word = buffer + part;
        buffer = ""; // Clear buffer

        // Subword splitting logic
        let remaining = word;
        let matched = false;

        // Try to match subwords
        // We only check subwords if the word part (without leading space) matches
        // But for simplicity in this mock, we'll just process the whole string

        // If the word starts with space, we want to maintain that association
        // We will simple-split the word part if needed, but keep the space on the first chunk

        let subTokens = [];
        let currentFragment = remaining;

        while (currentFragment.length > 0) {
            let found = false;
            // Check prefixes (greedy)
            for (let sub of subwords) {
                // We check if the trimmed version starts with subword, to handle the leading space case
                // Actually, simplest mock is just to push the whole thing if it's not super long
                // or just split simplistically.

                // Let's rely on the original logic but be careful with the leading space
                const check = currentFragment.trimStart();
                const leadingSpace = currentFragment.substring(0, currentFragment.length - check.length);

                if (check.toLowerCase().startsWith(sub) && check.length > sub.length) {
                    subTokens.push(leadingSpace + check.substring(0, sub.length));
                    currentFragment = check.substring(sub.length);
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Check suffixes
                for (let sub of subwords) {
                    const check = currentFragment.trimStart();
                    if (check.toLowerCase().endsWith(sub) && check.length > sub.length) {
                        const stemLen = check.length - sub.length;
                        const leadingSpace = currentFragment.substring(0, currentFragment.length - check.length);

                        subTokens.push(leadingSpace + check.substring(0, stemLen));
                        subTokens.push(check.substring(stemLen)); // Suffix usually doesn't have space
                        currentFragment = "";
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                subTokens.push(currentFragment);
                currentFragment = "";
            }
        }
        tokens.push(...subTokens);
    });

    // If any trailing whitespace remains in buffer
    if (buffer) {
        tokens.push(buffer);
    }

    return tokens;
}

// Knowledge Base for RAG
export const ragDB = [
    { id: 1, text: "To turn on, press button for 3s.", tags: ["turn", "on", "button", "power"] },
    { id: 2, text: "Battery lasts 24 hours on eco mode.", tags: ["battery", "life", "hours", "eco"] },
    { id: 3, text: "Lunch is served at 12:00 PM.", tags: ["lunch", "food", "time"] },
    { id: 4, text: "Warning: Do not submerge in water.", tags: ["water", "warning", "danger"] }
];

// Bigram Model for LLM Module
export const bigram = {
    "the": ["quick", "artificial", "future", "data"],
    "artificial": ["intelligence", "neural", "reality"],
    "hello": ["world", "user", "there"],
    "data": ["base", "science", "privacy"],
    "quick": ["brown", "response", "fix"],
    "brown": ["fox", "box", "note"]
};
