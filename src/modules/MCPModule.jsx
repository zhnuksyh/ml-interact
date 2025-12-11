import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Brain, Terminal, MessageSquare, ArrowRight } from 'lucide-react';

export default function MCPModule() {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState(0); // 0=Idle, 1=Thinking, 2=Calling, 3=Result
    const [thought, setThought] = useState('');
    const [tool, setTool] = useState('');
    const [result, setResult] = useState('');

    const run = () => {
        if (!input) return;
        setStatus(1);

        // 1. Router Logic
        setTimeout(() => {
            const lower = input.toLowerCase();
            let t = "none";
            let res = "I don't understand that command.";

            if (lower.includes('weather')) { t = "get_weather('London')"; res = "Temp: 15°C, Rain: None"; }
            else if (lower.includes('email')) { t = "send_email('Admin')"; res = "Email sent successfully."; }
            else if (lower.includes('db') || lower.includes('user')) { t = "query_db('SELECT *')"; res = "User found: ID 101"; }

            setThought(t !== 'none' ? "Identified intent. Routing to external tool." : "No tools required for this query.");
            setTool(t);
            setResult(res);

            setStatus(2);
        }, 800);
    };

    useEffect(() => {
        if (status === 2) {
            setTimeout(() => setStatus(3), 1000); // Exectution delay
        }
    }, [status]);

    return (
        <div className="flex flex-col gap-6 animate-fade-in animate-slide-up">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 8</span>
                    Model Context Protocol (MCP)
                </div>
                <p className="explainer-text">
                    AI Agents use "Tools" to affect the real world. Type a command containing "weather", "email", or "db".
                </p>
            </div>

            <div className="glass-panel p-6 rounded-xl">
                <div className="flex gap-4 mb-8">
                    <input
                        type="text" value={input} onChange={e => setInput(e.target.value)}
                        placeholder="e.g., Check the weather in London..."
                        className="bg-slate-800 text-white p-3 rounded-lg flex-1 border border-slate-700 outline-none focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && run()}
                    />
                    <button
                        onClick={run} disabled={status > 0 && status < 3}
                        className="btn-primary px-8 rounded-lg text-white font-bold disabled:opacity-50 transition-all"
                    >
                        Execute
                    </button>
                </div>

                <div className="space-y-4 max-w-3xl mx-auto">
                    {/* Step 1: Router */}
                    <div className={clsx(
                        "flex items-center gap-4 transition-all duration-500",
                        status >= 1 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 z-10">
                            <Brain className="w-5 h-5" />
                        </div>
                        <div className="flex-1 bg-slate-800 p-3 rounded-r-xl rounded-bl-xl border-l-[3px] border-purple-500 text-sm">
                            <span className="text-purple-300 font-bold text-xs uppercase block mb-1">Router Thought</span>
                            {thought}
                        </div>
                    </div>

                    {status >= 2 && <ArrowRight className="w-5 h-5 text-slate-600 mx-auto rotate-90 my-2" />}

                    {/* Step 2: Tool Execution */}
                    <div className={clsx(
                        "flex items-center gap-4 transition-all duration-500",
                        status >= 2 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50 z-10">
                            <Terminal className="w-5 h-5" />
                        </div>
                        <div className="flex-1 bg-black p-3 rounded-r-xl rounded-bl-xl border border-blue-900/50 text-sm font-mono text-blue-300">
                            <span className="text-slate-500 font-bold text-xs uppercase block mb-1">Function Call</span>
                            {tool === 'none' ? <span className="text-slate-500 opacity-50">-- SKIPPED --</span> : tool}
                        </div>
                    </div>

                    {status >= 3 && <ArrowRight className="w-5 h-5 text-slate-600 mx-auto rotate-90 my-2" />}

                    {/* Step 3: Final Output */}
                    <div className={clsx(
                        "flex items-center gap-4 transition-all duration-500",
                        status >= 3 ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    )}>
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-900/50 z-10">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-r-xl rounded-bl-xl border-l-[3px] border-green-500 text-sm">
                            <span className="text-green-400 font-bold text-xs uppercase block mb-1">Final Response</span>
                            {result}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
