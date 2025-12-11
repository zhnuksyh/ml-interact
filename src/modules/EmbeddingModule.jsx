import { useState, useRef, useMemo } from 'react';
import { getEmbedding } from '../utils/ml-logic';
import clsx from 'clsx';

export default function EmbeddingModule() {
    const [text, setText] = useState('');
    const [dragNode, setDragNode] = useState({ x: 50, y: 50 }); // Percentage
    const containerRef = useRef(null);

    const vec = useMemo(() => getEmbedding(text || 'vision'), [text]);

    const labels = ["Tech", "Org", "Space", "Abst", "Act", "Pos"];
    const descriptions = [
        "Technical vs Non-technical context",
        "Organic/Living vs Artificial",
        "Cosmic/Physical Scale",
        "Abstract Concepts vs Concrete Objects",
        "Action/Verb intensity",
        "Positive vs Negative Sentiment"
    ];

    // Static Knowledge Points for the drag demo
    const points = [
        { x: 20, y: 20, n: 'Banana', c: 'Organic' },
        { x: 80, y: 20, n: 'Server', c: 'Tech' },
        { x: 50, y: 80, n: 'Rocket', c: 'Space' },
        { x: 30, y: 50, n: 'Apple', c: 'Organic' },
        { x: 70, y: 30, n: 'Laptop', c: 'Tech' },
        { x: 60, y: 90, n: 'Mars', c: 'Space' }
    ];

    // Calculate nearest neighbor
    const nearest = useMemo(() => {
        let min = Infinity;
        let best = null;
        // Assume container is roughly square aspect ratio for simple logic, 
        // or just use raw percentage distance
        points.forEach(p => {
            const d = Math.sqrt(Math.pow(dragNode.x - p.x, 2) + Math.pow(dragNode.y - p.y, 2));
            if (d < min) { min = d; best = p; }
        });
        return { point: best, dist: Math.round(min * 5) }; // Scaled dist
    }, [dragNode]);

    const handleDrag = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const updatePos = (clientX, clientY) => {
            let x = ((clientX - rect.left) / rect.width) * 100;
            let y = ((clientY - rect.top) / rect.height) * 100;
            // Clamp
            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));
            setDragNode({ x, y });
        };

        const handleMouseMove = (moveEvent) => updatePos(moveEvent.clientX, moveEvent.clientY);
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Initial click update
        updatePos(e.clientX, e.clientY);
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in animate-slide-up">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 2</span>
                    Vector Embeddings
                </div>
                <p className="explainer-text">
                    Translation of words into coordinates. Type a word to see its "semantic location" in 3 dimensions.
                </p>
            </div>

            <div className="flex flex-col gap-4 flex-1">
                {/* Input Area */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-center gap-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type: Apple, Code, Cat..."
                        className="bg-slate-800 border border-slate-700 rounded p-3 text-white text-center text-xl outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Vector Output */}
                <div className="glass-panel p-3 rounded-xl border border-slate-700/50 flex justify-center items-center bg-black/20">
                    <div className="font-mono text-xs md:text-sm text-green-400 break-all text-center">
                        [{vec.map(v => v.toFixed(3)).join(', ')}]
                    </div>
                </div>

                {/* Dimensions Grid with Tooltips */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-700/50">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
                        6-Dimensional Vector
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {vec.map((v, i) => (
                            <div key={i} className="tooltip-container bg-slate-900 p-2 rounded border border-slate-700 text-center hover:bg-slate-800 transition-colors">
                                <span className="tooltip-text">{descriptions[i]}</span>
                                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">
                                    {labels[i]}
                                </div>
                                <div className="text-blue-400 font-bold text-xs font-mono">
                                    {v.toFixed(3)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-2">
                        * Real models use 768, 1024, or 4096 dimensions.
                    </p>
                </div>
            </div>

            <hr className="border-slate-800 my-4" />

            {/* Drag Demo */}
            <div className="flex flex-col md:flex-row gap-6 h-[400px]">
                <div className="w-64 shrink-0 flex flex-col justify-center">
                    <h3 className="font-bold text-lg text-white mb-2">Vector Search Demo</h3>
                    <p className="explainer-text">
                        Drag the <strong>User Query</strong> node. It calculates Euclidean distance to find the nearest concept.
                    </p>

                    <div className="mt-8 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="text-xs text-slate-400 mb-1">Nearest Concept</div>
                        <div className={clsx("text-lg font-bold transition-colors", nearest.dist < 15 ? "text-green-400" : "text-white")}>
                            {nearest.point?.n}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Distance: {nearest.dist}</div>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="glass-panel rounded-2xl flex-1 relative overflow-hidden border border-slate-700 cursor-crosshair no-select"
                    onMouseDown={handleDrag}
                >
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}>
                    </div>

                    {/* Static Points */}
                    {points.map((p, i) => (
                        <div
                            key={i}
                            className="vector-point bg-slate-500 flex items-center justify-center"
                            style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        >
                            <span className="absolute -top-6 text-xs bg-red-900/80 text-white px-1 rounded whitespace-nowrap">
                                {p.n}
                            </span>
                        </div>
                    ))}

                    {/* Query Node */}
                    <div
                        className="vector-point bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 w-4 h-4"
                        style={{ left: `${dragNode.x}%`, top: `${dragNode.y}%` }}
                    >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold whitespace-nowrap cursor-grab active:cursor-grabbing">
                            Drag Me
                        </span>
                    </div>

                    {/* Connection Line */}
                    {nearest.point && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line
                                x1={`${dragNode.x}%`}
                                y1={`${dragNode.y}%`}
                                x2={`${nearest.point.x}%`}
                                y2={`${nearest.point.y}%`}
                                stroke={nearest.dist < 15 ? "#4ade80" : "#3b82f6"}
                                strokeWidth="2"
                                strokeDasharray="4"
                            />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}
