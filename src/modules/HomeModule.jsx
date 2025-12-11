import { Atom, Columns, Cuboid, Database, MessageSquare, Cpu, Scan, Globe, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function HomeModule({ onNavigate }) {
    const modules = [
        { id: 'chunking', icon: Columns, title: 'Chunking', desc: 'Split text into semantic parts.', color: 'text-blue-400', bg: 'bg-blue-900/20' },
        { id: 'embedding', icon: Cuboid, title: 'Embeddings', desc: 'Visualize text as vectors in 3D space.', color: 'text-purple-400', bg: 'bg-purple-900/20' },
        { id: 'rag', icon: Database, title: 'Vector Search', desc: 'See how Cosine Similarity finds matches.', color: 'text-green-400', bg: 'bg-green-900/20' },
        { id: 'quantization', icon: Scan, title: 'Quantization', desc: 'Compress models from FP16 to INT8.', color: 'text-orange-400', bg: 'bg-orange-900/20' },
        { id: 'pipeline', icon: Atom, title: 'Full Pipeline', desc: 'End-to-end RAG workflow wizard.', color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
        { id: 'llm', icon: MessageSquare, title: 'LLM Basics', desc: 'Predicting tokens one by one.', color: 'text-pink-400', bg: 'bg-pink-900/20' },
        { id: 'inference', icon: Cpu, title: 'Inference', desc: 'Latency simulation (Cloud vs Local).', color: 'text-red-400', bg: 'bg-red-900/20' },
        { id: 'ocr', icon: Scan, title: 'Vision / OCR', desc: 'Extracting text from images.', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
        { id: 'mcp', icon: Globe, title: 'MCP / Tools', desc: 'Connecting LLMs to external APIs.', color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
    ];

    return (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
            {/* Hero Section */}
            <div className="text-center py-12 px-4 rounded-3xl bg-gradient-to-b from-blue-900/20 to-transparent border border-white/5 relative overflow-hidden animate-zoom-in">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none animate-float"></div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-slate-300 mb-6">
                    <Atom className="w-3 h-3 text-blue-400" />
                    <span>Interactive AI Learning Platform</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-400 mb-6 tracking-tight">
                    Demystifying the <br className="hidden md:block" />
                    <span className="text-blue-500">AI Stack</span>, One Layer at a Time
                </h1>

                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
                    Explore the inner workings of Large Language Models, RAG pipelines, and Vector Databases through interactive visualizations and real-time simulations.
                </p>

                <button
                    onClick={() => onNavigate('pipeline')}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25"
                >
                    Start Full Pipeline
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Modules Grid */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                    Explore Modules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((m, i) => (
                        <button
                            key={m.id}
                            onClick={() => onNavigate(m.id)}
                            className="text-left group glass-panel p-5 rounded-xl hover:border-blue-500/50 transition-all hover:bg-slate-800/80 relative overflow-hidden animate-slide-up"
                            style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'both' }}
                        >
                            <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110", m.bg)}>
                                <m.icon className={clsx("w-6 h-6", m.color)} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 mb-1 group-hover:text-blue-300 transition-colors">
                                {m.title}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {m.desc}
                            </p>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer Info */}
            <div className="text-center border-t border-slate-800 pt-8 pb-4">
                <p className="text-sm text-slate-500">
                    Interact v1.1 • Built for Developers & Researchers
                </p>
            </div>
        </div>
    );
}
