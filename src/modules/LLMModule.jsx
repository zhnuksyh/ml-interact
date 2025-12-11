import { useState } from 'react';
import { bigram } from '../utils/ml-logic';
import clsx from 'clsx';

export default function LLMModule() {
    const [input, setInput] = useState('The');
    const [temp, setTemp] = useState(0.7);
    const [candidates, setCandidates] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);

    const runPrediction = () => {
        setLoading(true);
        setCandidates(null);
        setSelected(null);

        setTimeout(() => {
            const lastWord = input.toLowerCase().trim().split(' ').pop();
            const words = bigram[lastWord] || ["is", "the", "a", "unknown"];

            // Randomize probs slightly
            const probs = words.map(w => ({ w, p: Math.floor(Math.random() * 80) + 10 }));
            probs.sort((a, b) => b.p - a.p);
            const total = probs.reduce((a, b) => a + b.p, 0);

            // Normalize to %
            const finalProbs = probs.map(i => ({ ...i, pct: Math.floor((i.p / total) * 100) }));
            setCandidates(finalProbs);

            // Selection Logic based on Temp
            const idx = temp < 0.5 ? 0 : Math.floor(Math.random() * finalProbs.length);
            setSelected(finalProbs[idx]);

            setLoading(false);
        }, 600);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 5</span>
                    LLM Basics: Prediction
                </div>
                <p className="explainer-text">
                    LLMs don't "write" — they predict the next token based on probability.
                    Type a word like "the", "hello", "artificial".
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
                    <button
                        onClick={runPrediction} disabled={loading}
                        className="btn-primary w-full py-3 rounded mt-auto font-bold text-white disabled:opacity-50"
                    >
                        {loading ? "Calculating..." : "Predict Next Token"}
                    </button>
                </div>

                <div className="glass-panel p-6 rounded-xl min-h-[300px] flex flex-col">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Top Candidates</h4>

                    {loading && <div className="text-blue-400 animate-pulse text-center mt-10">Running Softmax...</div>}

                    {!loading && candidates && (
                        <div className="space-y-4 flex-1">
                            {candidates.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                                    <span className="w-16 text-right text-slate-300 font-mono">"{c.w}"</span>
                                    <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700">
                                        <div
                                            className={clsx("h-full transition-all duration-1000", i === 0 ? "bg-blue-500" : "bg-blue-900/50")}
                                            style={{ width: `${c.pct}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-white font-bold">{c.pct}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && selected && (
                        <div className="mt-4 pt-4 border-t border-slate-700 text-center animate-in zoom-in">
                            <div className="text-xs text-slate-500 mb-1">Selected Token</div>
                            <div className="font-bold text-2xl text-green-400">"{selected.w}"</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
