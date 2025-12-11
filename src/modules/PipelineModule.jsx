import { useState } from 'react';
import clsx from 'clsx';
// Reusing components to build the pipeline view
import { tokenize, getEmbedding } from '../utils/ml-logic';

export default function PipelineModule() {
    const [step, setStep] = useState(0);

    // Step 2 Logic (Embedding)
    const [word, setWord] = useState('');
    const vec = getEmbedding(word || 'vector');

    // Step 3 Logic (Drag)
    // Simplified inline-drag logic for the wizard
    const [dragNode, setDragNode] = useState({ x: 50, y: 50 });
    const points = [
        { x: 20, y: 20, n: 'Banana', c: 'Organic' },
        { x: 80, y: 20, n: 'Server', c: 'Tech' },
        { x: 50, y: 80, n: 'Rocket', c: 'Space' }
    ];
    // Find nearest
    let nearest = { dist: Infinity, point: null };
    points.forEach(p => {
        const d = Math.sqrt(Math.pow(dragNode.x - p.x, 2) + Math.pow(dragNode.y - p.y, 2));
        if (d < nearest.dist) nearest = { dist: d, point: p };
    });
    const nearestName = nearest.point?.n || "Unknown";

    const handleDrag = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        setDragNode({ x, y });
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between mb-8 px-10">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className={clsx(
                            "w-3 h-3 rounded-full transition-all duration-300",
                            i <= step ? "bg-blue-500 scale-125 shadow-lg shadow-blue-500/50" : "bg-slate-700"
                        )}></div>
                        {i < 5 && <div className="h-[2px] w-full bg-slate-800 mx-2"></div>}
                    </div>
                ))}
            </div>

            <div className="flex-1 relative min-h-[400px]">

                {/* STEP 0: INTRO */}
                {step === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
                        <div className="explainer-box max-w-lg mx-auto text-left mb-8">
                            <h4 className="explainer-title">Concept: The Lifecycle of a Thought</h4>
                            <p className="explainer-text">
                                AI doesn't just "think." It follows a rigid mathematical pipeline.
                                <br />Input → Tokenize → Embed → Search → Generate.
                            </p>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-6">How LLMs Actually Work</h1>
                        <button onClick={() => setStep(1)} className="btn-primary px-8 py-3 rounded-full text-white font-semibold text-lg">
                            Start Journey
                        </button>
                    </div>
                )}

                {/* STEP 1: CHUNKING/TOKENIZING */}
                {step === 1 && (
                    <div className="absolute inset-0 flex flex-col animate-in slide-in-from-right-10 duration-300">
                        <div className="explainer-box">
                            <h4 className="explainer-title">1. Tokenization</h4>
                            <p className="explainer-text">The text is broken down into numerical tokens.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col items-center justify-center gap-6">
                            <div className="text-2xl font-mono text-white">"What is a Banana?"</div>
                            <div className="text-2xl text-slate-600">↓</div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {tokenize("What is a Banana?").map((t, i) => (
                                    <span key={i} className="bg-blue-900/40 border border-blue-500/30 text-blue-200 px-3 py-1 rounded">
                                        {t.replace(' ', '\u00A0')}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setStep(2)} className="btn-primary px-6 py-2 rounded text-white text-sm font-bold">Next Step</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: EMBEDDING */}
                {step === 2 && (
                    <div className="absolute inset-0 flex flex-col animate-in slide-in-from-right-10 duration-300">
                        <div className="explainer-box">
                            <h4 className="explainer-title">2. Embedding</h4>
                            <p className="explainer-text">Tokens are converted into multidimensional vectors.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col items-center justify-center gap-6">
                            <input
                                type="text" value={word} onChange={e => setWord(e.target.value)}
                                placeholder="Type a word..."
                                className="bg-slate-800 text-white p-3 rounded text-center border border-slate-700"
                            />
                            <div className="font-mono text-green-400 text-sm bg-black/30 p-4 rounded border border-green-900/30">
                                [{vec.map(v => v.toFixed(3)).join(', ')}]
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => setStep(1)} className="text-slate-400 text-sm">Back</button>
                            <button onClick={() => setStep(3)} className="btn-primary px-6 py-2 rounded text-white text-sm font-bold">Next Step</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SEARCH */}
                {step === 3 && (
                    <div className="absolute inset-0 flex flex-col animate-in slide-in-from-right-10 duration-300">
                        <div className="explainer-box">
                            <h4 className="explainer-title">3. Semantic Search</h4>
                            <p className="explainer-text">Drag the query to find the nearest concept in vector space.</p>
                        </div>
                        <div
                            className="glass-panel rounded-xl flex-1 relative overflow-hidden cursor-crosshair border border-slate-700"
                            onMouseDown={handleDrag} onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
                        >
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>

                            {points.map((p, i) => (
                                <div key={i} className="absolute w-4 h-4 bg-slate-500 rounded-full flex items-center justify-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                                    <span className="absolute -top-5 text-xs text-slate-300">{p.n}</span>
                                </div>
                            ))}

                            <div className="absolute w-4 h-4 bg-blue-500 shadow-[0_0_15px_blue] rounded-full z-10" style={{ left: `${dragNode.x}%`, top: `${dragNode.y}%` }}>
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-1 rounded whitespace-nowrap">Query</div>
                            </div>

                            <div className="absolute bottom-4 left-4 bg-slate-900/90 p-2 rounded border border-slate-700 text-xs">
                                <div>Nearest: <span className="font-bold text-white">{nearestName}</span></div>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => setStep(2)} className="text-slate-400 text-sm">Back</button>
                            <button onClick={() => setStep(4)} className="btn-primary px-6 py-2 rounded text-white text-sm font-bold">Next Step</button>
                        </div>
                    </div>
                )}

                {/* STEP 4: GENERATION */}
                {step === 4 && (
                    <div className="absolute inset-0 flex flex-col animate-in slide-in-from-right-10 duration-300">
                        <div className="explainer-box">
                            <h4 className="explainer-title">4. Generation</h4>
                            <p className="explainer-text">The LLM uses the retrieved context to answer.</p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl flex-1 flex flex-col items-center justify-center gap-6">
                            <div className="w-full bg-slate-900 p-4 rounded border border-slate-800 text-xs text-slate-400 font-mono">
                                <div className="mb-2"><span className="text-blue-400 font-bold">SYSTEM:</span> You are helpful.</div>
                                <div className="mb-2">
                                    <span className="text-green-400 font-bold">CONTEXT:</span>
                                    <span className="text-slate-300 ml-1">"Banana (Organic) is a fruit."</span>
                                </div>
                                <div><span className="text-white font-bold">QUERY:</span> What is a Banana?</div>
                            </div>
                            <div className="text-2xl text-slate-600">↓</div>
                            <div className="w-full bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded border border-blue-500/30 text-center animate-pulse">
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded mb-2 inline-block">AI OUTPUT</span>
                                <p className="text-lg text-white">"A Banana is an Organic fruit."</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => setStep(3)} className="text-slate-400 text-sm">Back</button>
                            <button onClick={() => setStep(5)} className="btn-primary px-6 py-2 rounded text-white text-sm font-bold">Finish</button>
                        </div>
                    </div>
                )}

                {/* STEP 5: SUMMARY */}
                {step === 5 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-4">Pipeline Complete</h2>
                        <div className="glass-panel p-8 rounded-xl flex gap-4 text-xs text-center border border-slate-700">
                            <div>
                                <div className="bg-slate-800 p-2 rounded mb-2">Input</div>
                                <div className="text-slate-400">text</div>
                            </div>
                            <div className="self-center">→</div>
                            <div>
                                <div className="bg-slate-800 p-2 rounded mb-2">Tokenize</div>
                                <div className="text-slate-400">[102, 34]</div>
                            </div>
                            <div className="self-center">→</div>
                            <div>
                                <div className="bg-slate-800 p-2 rounded mb-2">Embed</div>
                                <div className="text-slate-400">[0.1, 0.9]</div>
                            </div>
                            <div className="self-center">→</div>
                            <div>
                                <div className="bg-slate-800 p-2 rounded mb-2">Search</div>
                                <div className="text-slate-400">Retrieved</div>
                            </div>
                            <div className="self-center">→</div>
                            <div>
                                <div className="bg-blue-900/40 border border-blue-500 p-2 rounded mb-2 text-white">Generate</div>
                                <div className="text-slate-400">Output</div>
                            </div>
                        </div>
                        <button onClick={() => setStep(0)} className="mt-8 text-blue-400 hover:text-white transition-colors">Restart</button>
                    </div>
                )}
            </div>
        </div>
    );
}
