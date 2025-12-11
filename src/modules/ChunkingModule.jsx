import { useState, useMemo } from 'react';
import { tokenize } from '../utils/ml-logic';
import clsx from 'clsx';

export default function ChunkingModule() {
    const [text, setText] = useState("Artificial intelligence is transforming the world of data science and neural networks.");
    const [chunkSize, setChunkSize] = useState(25);
    const [overlap, setOverlap] = useState(0);
    const [model, setModel] = useState('gpt4o');
    const [isExpanded, setIsExpanded] = useState(false);
    const [smartMode, setSmartMode] = useState(false);

    // Calculate Chunks
    const chunks = useMemo(() => {
        let res = [];
        let i = 0;

        while (i < text.length) {
            let limit = i + chunkSize;
            let end = Math.min(limit, text.length);

            if (smartMode && end < text.length) {
                // Recursive Semantic splitting:
                // Try to break at: \n\n > \n > . > , > space
                const delimiters = [
                    { char: '\n\n', len: 2 },
                    { char: '\n', len: 1 },
                    { char: '. ', len: 1 }, // keep the period, break after
                    { char: ', ', len: 1 },
                    { char: ' ', len: 1 }
                ];

                let bestBreak = -1;
                let bufferZone = Math.min(30, chunkSize * 0.3); // Look back 30% or 30 chars
                let searchStart = Math.max(i, end - 50); // Don't allow chunks smaller than X effectively

                for (let d of delimiters) {
                    const lastIdx = text.lastIndexOf(d.char, end);
                    // Must be within reasonably close range to the limit (don't shrink chunk too much)
                    if (lastIdx > i + (chunkSize * 0.5)) {
                        bestBreak = lastIdx + d.len; // Include delimiter in prev chunk usually, or split after
                        if (d.char === '. ') bestBreak = lastIdx + 1; // Keep . in first chunk
                        break; // Found highest priority delimiter
                    }
                }

                if (bestBreak > i) {
                    end = bestBreak;
                }
            }

            let chunkText = text.substring(i, end).trim();
            if (chunkText) res.push(chunkText);

            if (end === text.length) break; // Stop if we've reached the end

            // Calculate next start
            if (smartMode) {
                let nextI = end;
                // Move start forward to skip delimiter spaces if needed
                while (nextI < text.length && (text[nextI] === ' ' || text[nextI] === '\n')) {
                    nextI++;
                }

                if (overlap > 0) {
                    nextI = Math.max(i + 1, end - overlap);
                }

                // SAFETY: Ensure we always advance
                i = Math.max(i + 1, nextI);
            } else {
                i += Math.max(1, chunkSize - overlap);
            }
        }

        // Simple filter for tiny trailing chunks
        if (res.length > 1 && res[res.length - 1].length < 5) res.pop();

        return res;
    }, [text, chunkSize, overlap, smartMode]);

    // PRESETS
    const applyOptimalSettings = () => {
        setSmartMode(true);
        setChunkSize(150);
        setOverlap(30);
    };

    // Calculate Tokens
    const tokens = useMemo(() => tokenize(text, model), [text, model]);

    // Cost Logic
    const models = {
        'gpt4o': { name: 'GPT-4o', in: 5.00, out: 15.00, ctx: '128k', outLimit: 4096, ctxVal: 128000, color: 'bg-green-900/50 text-green-200' },
        'claude35': { name: 'Claude 3.5', in: 3.00, out: 15.00, ctx: '200k', outLimit: 8192, ctxVal: 200000, color: 'bg-orange-900/50 text-orange-200' },
        'gemini15': { name: 'Gemini 1.5', in: 3.50, out: 10.50, ctx: '1M+', outLimit: 8192, ctxVal: 1000000, color: 'bg-blue-900/50 text-blue-200' },
        'ollama': { name: 'Llama 3', in: 0, out: 0, ctx: '8k', outLimit: 8192, ctxVal: 8192, color: 'bg-slate-700 text-slate-200' }
    };
    const info = models[model];
    const cost = (tokens.length / 1000000) * info.in;

    // Derived State for UI
    const isOptimal = chunkSize === 150 && overlap === 30 && smartMode;

    const toggleOptimal = () => {
        if (!isOptimal) {
            applyOptimalSettings();
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in animate-zoom-in">
            {/* ... (Explainer + Inputs skipped for brevity, keeping existing structure) ... */}

            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 1</span>
                    Tokenization & Chunking
                </div>
                <p className="explainer-text">
                    Before processing, text must be broken into "Tokens" (for the model) and "Chunks" (for the database).
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="flex flex-col gap-4">
                    <div className="glass-panel p-4 rounded-xl">
                        <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Source Text</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-32 bg-slate-800 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="glass-panel p-4 rounded-xl space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400 font-bold uppercase">Model Tokenizer</span>
                            </div>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                            >
                                {Object.keys(models).map(k => (
                                    <option key={k} value={k}>{models[k].name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-xs text-slate-500 italic">
                            * Educational simulation. Real tokenizers vary.
                        </div>
                    </div>
                </div>

                {/* Token Viz */}
                <div className="glass-panel p-4 rounded-xl flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-white">Token Stream</h4>
                        <div className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            Count: <span className="text-blue-400 font-bold">{tokens.length}</span>
                            <span className="mx-2 text-slate-600">|</span>
                            Cost: <span className="text-green-400 font-bold">${cost.toFixed(6)}</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-900/50 p-3 rounded border border-slate-800 font-mono text-sm leading-6 overflow-y-auto max-h-[300px]">
                        {tokens.map((t, i) => (
                            <span
                                key={i}
                                className={clsx(
                                    "px-1 rounded border border-white/5 inline-block mb-1 mx-[1px]",
                                    i % 2 === 0 ? info.color : info.color.replace('bg-', 'bg-black/20 border-').replace('text-', 'text-opacity-80 text-')
                                )}
                            >
                                {t.replace(' ', '\u00A0')}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chunking Viz */}
            <div className="glass-panel p-4 rounded-xl">
                <div className="flex flex-col border-b border-slate-800 pb-4 mb-4">
                    <div className="flex justify-end items-center gap-6 mb-4">
                        {/* Auto-Optimal Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <span className={clsx(
                                "text-xs font-bold transition-colors uppercase tracking-wider",
                                isOptimal ? "text-green-400" : "text-slate-400 group-hover:text-green-400"
                            )}>
                                Auto-Optimal
                            </span>
                            <div className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isOptimal}
                                    onChange={toggleOptimal}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                            </div>
                        </label>

                        {/* Smart Chunking Toggle */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-blue-400 transition-colors uppercase tracking-wider">
                                Smart Chunking
                            </span>
                            <div className="relative inline-flex items-center">
                                <input
                                    type="checkbox"
                                    checked={smartMode}
                                    onChange={(e) => setSmartMode(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Chunk Size</span>
                                <span className="font-bold text-blue-400">{chunkSize} chars</span>
                            </div>
                            <input
                                type="range" min="5" max="200" step="1"
                                value={chunkSize}
                                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Overlap</span>
                                <span className="font-bold text-purple-400">{overlap} chars</span>
                            </div>
                            <input
                                type="range" min="0" max={Math.max(0, chunkSize - 5)} step="1"
                                value={overlap}
                                onChange={(e) => setOverlap(parseInt(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                        </div>
                    </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-3">Document Chunks</h4>
                <div className="space-y-2">
                    {(isExpanded ? chunks : chunks.slice(0, 5)).map((chunk, i) => (
                        <div
                            key={i}
                            className="flex gap-3 animate-pop-in opacity-0 fill-mode-forwards"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="w-8 shrink-0 flex flex-col items-center pt-1">
                                <div className="w-6 h-6 shrink-0 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {i + 1}
                                </div>
                                {i < chunks.length - 1 && <div className="w-[1px] h-full bg-slate-800 my-1"></div>}
                            </div>
                            <div className={clsx("flex-1 p-3 rounded border text-sm transition-all hover:scale-[1.01] hover:shadow-lg", `chunk-${i % 4}`)}>
                                {chunk}
                            </div>
                        </div>
                    ))}

                    {chunks.length > 5 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full py-2 mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-blue-500/50 rounded transition-all group"
                        >
                            {isExpanded ? (
                                <>Show Less</>
                            ) : (
                                <>Show {chunks.length - 5} More Chunks</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Simulation Stats */}
            <div className="glass-panel p-6 rounded-xl border border-slate-700">
                <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Context & Cost Simulation</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Context Window</div>
                        <div className="text-lg font-mono text-white">{info.ctx}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Input Tokens</div>
                        <div className="text-lg font-mono text-blue-400">{tokens.length}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Max Output</div>
                        <div className="text-lg font-mono text-purple-400">{info.outLimit.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded border border-slate-700 text-center">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Context Usage</div>
                        <div className="text-lg font-mono text-green-400">
                            {((tokens.length / info.ctxVal) * 100).toFixed(6)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
