import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Cpu, Scale, HardDrive } from 'lucide-react';

export default function QuantizationModule() {
    const [level, setLevel] = useState(0); // 0=FP32, 1=FP16, 2=INT8, 3=INT4

    // Sample Neural Weights (Random distribution for visualization)
    const weights = useMemo(() => [
        0.12345678, -0.98765432, 0.55555555, -0.11111111,
        0.00000001, 0.88888888, -0.44444444, 0.33333333,
        0.77777777, -0.22222222, 0.66666666, -0.55555555
    ], []);

    const stats = [
        { name: 'FP32', sz: "28 GB", ram: "32 GB", loss: "0%", col: "text-green-400", hw: "Server GPU (A100)" },
        { name: 'FP16', sz: "14 GB", ram: "16 GB", loss: "0.01%", col: "text-green-300", hw: "Desktop GPU (RTX 4090)" },
        { name: 'INT8', sz: "7 GB", ram: "8 GB", loss: "0.5%", col: "text-yellow-400", hw: "Laptop (MacBook M1)" },
        { name: 'INT4', sz: "3.5 GB", ram: "4 GB", loss: "3-5%", col: "text-red-400", hw: "Phone (iPhone 15)" }
    ];

    const currentStat = stats[level];

    const processedWeights = weights.map(w => {
        if (level === 0) return { val: w.toFixed(8), bg: 'bg-slate-900', txt: 'text-slate-400' };
        if (level === 1) return { val: w.toFixed(4), bg: 'bg-indigo-950', txt: 'text-indigo-400' };
        if (level === 2) return { val: (Math.round(w * 127) / 127).toFixed(2), bg: 'bg-blue-950', txt: 'text-blue-400' };
        return { val: w > 0 ? '1' : '0', bg: 'bg-red-950', txt: 'text-red-300' };
    });

    return (
        <div className="flex flex-col gap-6 animate-fade-in animate-slide-up">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 4</span>
                    Weight Quantization
                </div>
                <p className="explainer-text">
                    <strong>Live Simulation:</strong> Adjust the slider to see how floating point numbers are compressed.
                    Simulating a 7B parameter model.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                    {/* Controls */}
                    <div className="glass-panel p-6 rounded-xl">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Compression Level</label>
                        <input
                            type="range" min="0" max="3" step="1"
                            value={level}
                            onChange={(e) => setLevel(parseInt(e.target.value))}
                            className="w-full accent-blue-500"
                        />
                        <div className="flex justify-between text-xs mt-2 text-slate-400 font-mono">
                            <span className={level === 0 ? "text-white font-bold" : ""}>FP32</span>
                            <span className={level === 1 ? "text-white font-bold" : ""}>FP16</span>
                            <span className={level === 2 ? "text-white font-bold" : ""}>INT8</span>
                            <span className={level === 3 ? "text-white font-bold" : ""}>INT4</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="glass-panel p-6 rounded-xl space-y-4">
                        <div className="flex items-center gap-3">
                            <HardDrive className="text-slate-500 w-5 h-5" />
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Model Size</div>
                                <div className="text-xl font-bold text-white">{currentStat.sz}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Cpu className="text-slate-500 w-5 h-5" />
                            <div>
                                <div className="text-xs text-slate-500 uppercase">RAM Required</div>
                                <div className="text-xl font-bold text-white">{currentStat.ram}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Scale className="text-slate-500 w-5 h-5" />
                            <div>
                                <div className="text-xs text-slate-500 uppercase">Precision Loss</div>
                                <div className={clsx("text-xl font-bold", currentStat.col)}>{currentStat.loss}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 glass-panel p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-white mb-4">Weight Matrix Visualization</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {processedWeights.map((w, i) => (
                            <div key={i} className={clsx("p-3 rounded text-center font-mono text-sm transition-all", w.bg, w.txt)}>
                                {w.val}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-700">
                        <Cpu className="text-blue-400 w-6 h-6" />
                        <div>
                            <div className="font-bold text-slate-200 text-xs uppercase">Hardware Check</div>
                            <div className="text-sm text-slate-400">Run on: <span className="text-white font-bold">{currentStat.hw}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
