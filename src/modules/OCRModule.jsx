import { useState, useRef } from 'react';
import clsx from 'clsx';
import { Scan, FileText, Image as ImageIcon } from 'lucide-react';

export default function OCRModule() {
    const [docType, setDocType] = useState('invoice');
    const [mode, setMode] = useState('vision');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    // Visual content mapping
    const visuals = {
        invoice: { title: "INVOICE #99", content: "Item: Jetpack\nCost: $9000", bg: "bg-white text-black" },
        idcard: { title: "ID CARD", content: "Name: Alice\nRole: Pilot", bg: "bg-blue-100 text-blue-900 border-2 border-blue-500" },
        note: { title: "", content: "Don't forget\nto feed the\nAI model!", bg: "bg-yellow-100 text-slate-800 font-handwriting italic rotate-1" }
    };

    const runScan = () => {
        setLoading(true);
        setOutput("Scanning...");

        setTimeout(() => {
            if (mode === 'legacy') {
                // Legacy: Raw ugly text
                const v = visuals[docType];
                setOutput((v.title + "\n" + v.content).toUpperCase());
            } else {
                // Vision: Structured JSON
                const v = visuals[docType];
                const data = {
                    type: docType,
                    detected_text: v.content.split('\n'),
                    confidence: 0.98,
                    metadata: { has_title: !!v.title }
                };
                setOutput(JSON.stringify(data, null, 2));
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 7</span>
                    Vision & OCR
                </div>
                <p className="explainer-text">
                    Multimodal models don't just "see" pixels; they understand structure. Compare generic OCR vs Vision Models.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 h-[400px]">
                {/* Visualizer */}
                <div className="glass-panel p-8 flex items-center justify-center bg-slate-900 relative rounded-xl border border-slate-700">
                    <div className="absolute top-4 left-4 z-10">
                        <select
                            value={docType} onChange={e => setDocType(e.target.value)}
                            className="bg-slate-800 text-white text-xs p-2 rounded border border-slate-600 outline-none focus:border-blue-500"
                        >
                            <option value="invoice">Invoice</option>
                            <option value="idcard">ID Card</option>
                            <option value="note">Sticky Note</option>
                        </select>
                    </div>

                    {/* The Document */}
                    <div className={clsx("w-48 h-64 shadow-2xl p-6 relative transition-all duration-500 flex flex-col justify-center items-center text-center", visuals[docType].bg)}>
                        {visuals[docType].title && <h3 className="font-bold border-b border-current mb-4 pb-2 w-full">{visuals[docType].title}</h3>}
                        <div className="whitespace-pre-wrap">{visuals[docType].content}</div>

                        {/* Scan Line Animation */}
                        {loading && (
                            <div className="absolute inset-0 border-b-2 border-red-500 bg-red-500/10 animate-[scan_1s_ease-in-out_infinite]"></div>
                        )}
                    </div>
                </div>

                {/* Controls & Output */}
                <div className="flex flex-col gap-4">
                    <div className="glass-panel p-4 rounded-xl">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Processing Mode</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode('legacy')}
                                className={clsx("flex-1 p-3 rounded border text-xs font-bold transition-all", mode === 'legacy' ? "bg-slate-700 border-white text-white" : "bg-slate-800 border-slate-700 text-slate-400")}
                            >
                                <FileText className="w-4 h-4 mx-auto mb-1" />
                                Legacy OCR
                            </button>
                            <button
                                onClick={() => setMode('vision')}
                                className={clsx("flex-1 p-3 rounded border text-xs font-bold transition-all", mode === 'vision' ? "bg-blue-600 border-blue-400 text-white" : "bg-slate-800 border-slate-700 text-slate-400")}
                            >
                                <ImageIcon className="w-4 h-4 mx-auto mb-1" />
                                Vision Model
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={runScan} disabled={loading}
                        className="btn-primary w-full py-3 rounded text-white font-bold disabled:opacity-50"
                    >
                        <Scan className="w-4 h-4 inline mr-2" />
                        {loading ? "Scanning Document..." : "Scan Document"}
                    </button>

                    <div className="glass-panel p-0 rounded-xl flex-1 overflow-hidden flex flex-col">
                        <div className="bg-slate-900 p-2 text-xs border-b border-slate-800 font-bold text-slate-400 px-4">
                            Output Console
                        </div>
                        <pre className={clsx(
                            "flex-1 p-4 text-xs overflow-auto font-mono",
                            mode === 'vision' ? "text-green-400" : "text-amber-200"
                        )}>
                            {output || <span className="text-slate-600 italic">Ready to scan...</span>}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
