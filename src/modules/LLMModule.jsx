import { useState } from 'react';
import { bigram, tinyLLM, garbageLLM } from '../utils/ml-logic';
import clsx from 'clsx';

export default function LLMModule() {
    const [input, setInput] = useState('The');
    const [temp, setTemp] = useState(0.7);
    const [candidates, setCandidates] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    // State for Autoregressive Loop
    const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
    const isGenerating = status === 'running';
    const [dataQuality, setDataQuality] = useState('good'); // 'good' | 'bad'
    const controlRef = useState({ current: false })[0]; // Ref for loop control

    // Recursive Generation Function
    const generateNextToken = async (currentInput) => {
        setLoading(true);
        // setCandidates(null); // Keep previous candidates visible
        setSelected(null);

        // 1. Simulate "Thinking" (Forward Pass)
        await new Promise(r => setTimeout(r, 600));
        if (!controlRef.current) return null; // Sharp Stop Check

        // Safely extract last word
        const words = currentInput.toLowerCase().trim().replace(/[^a-z ]/g, '').split(' ');
        const lastWord = words[words.length - 1] || "the";

        // Select Model based on Quality Settings
        const model = dataQuality === 'good' ? tinyLLM : garbageLLM;

        // Fallback to "the" or "is" if unknown
        const nextOptions = model[lastWord] || ["is", "the", "a", "."];

        // 2. Calculate Probabilities (Logits -> Softmax)
        const probs = nextOptions.map(w => ({ w, p: Math.floor(Math.random() * 60) + 10 }));
        probs.sort((a, b) => b.p - a.p);
        const total = probs.reduce((a, b) => a + b.p, 0);
        const finalProbs = probs.map(i => ({ ...i, pct: Math.floor((i.p / total) * 100) }));
        setCandidates(finalProbs);
        setLoading(false); // Stop "thinking", show candidates

        // 3. Simulate "Sampling" (Selection)
        await new Promise(r => setTimeout(r, 800)); // User reads candidates
        if (!controlRef.current) return null; // Sharp Stop Check

        // Select based on Temp (Simple greedy vs random logic for demo)
        const idx = temp < 0.5 ? 0 : (Math.random() > 0.7 ? 1 : 0);
        const choice = finalProbs[idx] || finalProbs[0];

        setSelected(choice);

        // 4. Return new input state
        if (choice.w !== "STOP") {
            const nextInput = currentInput + (choice.w === '.' ? "" : " ") + choice.w;
            setInput(nextInput);

            // Continue if not end of sentence
            if (choice.w !== ".") {
                return nextInput;
            }
        }
        return null; // Stop
    };

    const runGeneration = async () => {
        if (status === 'running') return;

        setStatus('running');
        controlRef.current = true;
        let current = input;

        // Generate up to 20 tokens automatically
        for (let i = 0; i < 20; i++) {
            if (!controlRef.current) break; // Check for pause/stop

            const next = await generateNextToken(current);
            if (!next) break;

            if (!controlRef.current) break; // Check again after await

            // UI Update is handled inside generateNextToken indirectly via setInput
            // But we need to update our local tracker 'current'
            current = next;

            // Short pause
            await new Promise(r => setTimeout(r, 300));
        }

        // If we exited loop naturally or via stop/pause
        if (controlRef.current) {
            setStatus('idle'); // Finished naturally
        } else {
            // If paused, we stay 'paused', if stopped we go 'idle'
            // The handler for buttons will set the status state directly
        }
    };

    const handlePause = () => {
        controlRef.current = false;
        setStatus('paused');
    };

    const handleStop = () => {
        controlRef.current = false;
        setStatus('idle');
        setCandidates(null);
        setSelected(null);
    };

    const handleClear = () => {
        controlRef.current = false;
        setStatus('idle');
        setInput('The');
        setCandidates(null);
        setSelected(null);
    };

    // Derived vars for Visualizer
    const prompt = input;
    // Highlight the *last* word if we just selected it
    const lastWord = input.split(' ').pop();
    const steps = selected ? [{ word: selected.w, top: true }] : [];

    // Dataset Simulation
    const CLEAN_CORPUS = [
        "The quick brown fox jumps over the lazy dog.",
        "Artificial Intelligence is transforming the future of data.",
        "Large language models predict the next token.",
        "Machine learning algorithms learn from data.",
        "Neural networks process information systematically.",
        "Deep learning is a powerful subset of AI.",
        "Generative models create new content automatically.",
        "The future of computing is intelligent and adaptive.",
        "Hello world is the classic first program.",
        "Data science rules the digital world today."
    ];

    const BAD_CORPUS = [
        "The potato noise uhh brown paint???",
        "Artificial flavor fake plastic smart missing.",
        "Large fat heavy noise predict maybe idk.",
        "Machine broken rust stop nothing.",
        "Neural spicy pasta web crash.",
        "Deep puddle shallow sleep void.",
        "Generative noise static void trash.",
        "Hello bye what huh.",
        "World flat cube simulation glitch.",
        "Data garbage trash null error."
    ];

    // Dataset View State
    const [isExpanded, setIsExpanded] = useState(false);
    const corpus = dataQuality === 'good' ? CLEAN_CORPUS : BAD_CORPUS;

    return (
        <div className="flex flex-col gap-6 animate-fade-in animate-slide-up">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 5</span>
                    LLM Basics: Prediction
                </div>
                <p className="explainer-text">
                    LLMs don't "write" all at once. They predict the <b>next token</b>, append it, and repeat (Autoregressive).
                    <b>Quality Matters:</b> A model trained on bad data will output bad results.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Input Word</label>
                        <input
                            type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mt-2"
                        />
                    </div>

                    {/* Dataset Selector */}
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Training Data Quality</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => !isGenerating && setDataQuality('good')}
                                disabled={isGenerating}
                                className={clsx("flex-1 py-2 rounded text-xs font-bold transition-all", dataQuality === 'good' ? "bg-green-600 text-white shadow-lg" : "bg-slate-700 text-slate-400 hover:bg-slate-600 disabled:opacity-50")}
                            >
                                Clean Data
                            </button>
                            <button
                                onClick={() => !isGenerating && setDataQuality('bad')}
                                disabled={isGenerating}
                                className={clsx("flex-1 py-2 rounded text-xs font-bold transition-all", dataQuality === 'bad' ? "bg-red-600 text-white shadow-lg" : "bg-slate-700 text-slate-400 hover:bg-slate-600 disabled:opacity-50")}
                            >
                                Bad Data
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                            <span>Temperature (Creativity)</span>
                            <span className="text-white">{temp}</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.1" value={temp}
                            onChange={(e) => setTemp(parseFloat(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                    </div>
                    {status === 'idle' ? (
                        <button
                            onClick={runGeneration}
                            disabled={input.length > 500}
                            className={clsx("w-full py-3 rounded mt-auto font-bold text-white transition-colors", dataQuality === 'bad' ? "bg-red-600 hover:bg-red-500" : "btn-primary")}
                        >
                            Run Generation
                        </button>
                    ) : (
                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-700 animate-slide-up">
                            {status === 'running' ? (
                                <button
                                    onClick={handlePause}
                                    className="flex-1 py-3 rounded font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="w-3 h-3 bg-white rounded-sm"></span> Pause
                                </button>
                            ) : (
                                <button
                                    onClick={runGeneration}
                                    className="flex-1 py-3 rounded font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></span> Resume
                                </button>
                            )}

                            <button
                                onClick={handleStop}
                                className="w-12 rounded font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                                title="Stop"
                            >
                                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                            </button>

                            <button
                                onClick={handleClear}
                                className="w-12 rounded font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                                title="Clear"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Visualizer */}
                <div className={clsx("glass-panel p-4 rounded-xl min-h-[200px] relative transition-colors duration-500", dataQuality === 'bad' ? "border-red-500/30 bg-red-900/10" : "")}>
                    <div className="flex flex-wrap gap-2 text-lg font-mono leading-relaxed">
                        {prompt.split(' ').map((word, i) => (
                            <span key={`p-${i}`} className="text-slate-400 animate-fade-in">{word}</span>
                        ))}
                        {selected && (
                            <span className={clsx("px-1 rounded border animate-pop-in", dataQuality === 'bad' ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30")}>
                                {selected.w}
                            </span>
                        )}
                        <span className={clsx("w-2 h-6 animate-pulse inline-block align-middle ml-1", dataQuality === 'bad' ? "bg-red-500" : "bg-blue-500")}></span>
                    </div>

                    {!isGenerating && !selected && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm flex-col gap-2">
                            <div>Click "Run Generation" to start...</div>
                            {dataQuality === 'bad' && <div className="text-red-400 text-xs font-bold">BAD DATA MODE ACTIVE</div>}
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel p-6 rounded-xl min-h-[300px] flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Top Candidates</h4>

                <div className={clsx("space-y-4 flex-1 transition-opacity duration-300", loading ? "opacity-50 grayscale" : "opacity-100")}>
                    {candidates ? (
                        candidates.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                                <span className="w-24 text-left text-slate-300 font-mono truncate" title={c.w}>"{c.w}"</span>
                                <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                                    <div
                                        className={clsx("h-full transition-all duration-1000", i === 0 ? "bg-blue-500" : "bg-blue-900/50")}
                                        style={{ width: `${c.pct}%` }}
                                    ></div>
                                </div>
                                <span className="w-8 text-right text-white font-bold">{c.pct}%</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-500 mt-10 italic">Click "Run Generation" to start...</div>
                    )}
                </div>

                <div className="mt-4 pt-4 pb-6 border-t border-slate-700 text-center min-h-[6rem] flex flex-col justify-center mb-2">
                    {selected ? (
                        <div className="animate-in zoom-in">
                            <div className="text-xs text-slate-500 mb-1">Selected Token</div>
                            <div className="font-bold text-2xl text-green-400">"{selected.w}"</div>
                        </div>
                    ) : (
                        <div className="text-slate-700 text-xs italic opacity-50">
                            {candidates ? "Computing next token..." : "Click 'Run Generation' to start..."}
                        </div>
                    )}
                </div>

                {/* Training Data Preview */}
                <div className="mt-auto pt-6 border-t border-slate-700/50 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <span>Training Data Preview</span>
                            <span className="opacity-50 font-mono text-[10px] bg-slate-800 px-1 py-0.5 rounded">
                                {dataQuality === 'good' ? 'clean_corpus.txt' : 'bad_dataset.log'}
                            </span>
                        </h4>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline"
                        >
                            {isExpanded ? 'Collapse' : `Show All (${corpus.length})`}
                        </button>
                    </div>

                    <div className={clsx("p-3 rounded text-xs font-mono leading-relaxed opacity-80 border overflow-hidden transition-all duration-500", dataQuality === 'good' ? "bg-slate-900 text-slate-400 border-slate-800" : "bg-red-900/10 text-red-300 border-red-500/20")}>
                        {corpus.slice(0, isExpanded ? corpus.length : 3).map((line, i) => (
                            <div key={i} className="whitespace-nowrap overflow-hidden text-ellipsis">
                                <span className={clsx("mr-3 select-none", dataQuality === 'good' ? "text-slate-700" : "text-red-900/40")}>
                                    {(i + 1).toString().padStart(2, '0')}
                                </span>
                                {line}
                            </div>
                        ))}
                        {!isExpanded && (
                            <div className="text-center mt-2 pt-2 border-t border-dashed border-slate-700/30 text-[10px] opacity-50 italic">
                                ... {corpus.length - 3} more lines hidden ...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
}
