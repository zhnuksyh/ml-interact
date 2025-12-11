import { Atom, Columns, Cuboid, Database, MessageSquare, Cpu, Scan, Globe, Home } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ activeTab, onSwitch }) {
    const menu = [
        { id: 'home', icon: Home, label: 'Overview' },
        { id: 'chunking', icon: Columns, label: 'Chunking' },
        { id: 'embedding', icon: Cuboid, label: 'Embeddings' },
        { id: 'rag', icon: Database, label: 'Vector Search' },
        { id: 'quantization', icon: Scan, label: 'Quantization' },
        { id: 'pipeline', icon: Atom, label: 'Full Pipeline' },
        { id: 'llm', icon: MessageSquare, label: 'LLM Basics' },
        { id: 'inference', icon: Cpu, label: 'Inference' },
        { id: 'ocr', icon: Scan, label: 'Vision / OCR' },
        { id: 'mcp', icon: Globe, label: 'MCP / Tools' },
    ];

    return (
        <div className="w-64 sidebar flex flex-col h-full bg-[#0f172a] border-r border-slate-800">
            <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Atom className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-wide text-white">Interact</h1>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[calc(100vh-140px)]">
                {menu.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onSwitch(item.id)}
                            className={clsx(
                                "nav-btn w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all text-left",
                                isActive
                                    ? "active bg-blue-500/10 text-blue-400 border-l-[3px] border-blue-400"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100 border-l-[3px] border-transparent"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-slate-800 p-6">
                <div className="text-xs text-slate-500 text-center">
                    Interact v0.0.1 <br />
                    from zhnuksyh repo
                </div>
            </div>
        </div>
    );
}
