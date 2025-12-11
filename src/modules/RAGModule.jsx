import { useState } from 'react';
import { getEmbedding, cosineSimilarity, ragDB } from '../utils/ml-logic';
import clsx from 'clsx';

export default function RAGModule() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);

    // Initial Processing of DB (simulating lazy load)
    const processedDB = ragDB.map(item => {
        if (item.vector) return item;
        let diff = [0, 0, 0, 0, 0, 0];
        item.tags.forEach(t => {
            const tv = getEmbedding(t);
            diff = diff.map((v, k) => v + tv[k]);
        });
        return { ...item, vector: diff.map(v => v / item.tags.length) };
    });

    const handleSearch = () => {
        // Simple Heuristic: Embed longest word or last word
        const words = query.split(' ');
        const subject = words.reduce((a, b) => a.length > b.length ? a : b, words[words.length - 1] || "");
        const qVec = getEmbedding(subject);

        let best = null, maxScore = -1;

        processedDB.forEach(chunk => {
            const score = cosineSimilarity(qVec, chunk.vector);
            if (score > maxScore) { maxScore = score; best = chunk; }
        });

        setResult({ best, score: maxScore });
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <div className="explainer-box">
                <div className="explainer-title">
                    <span className="bg-blue-600/20 text-blue-400 p-1 rounded mr-3 text-xs">MODULE 3</span>
                    Retrieval Augmented Generation (RAG)
                </div>
                <p className="explainer-text">
                    Search the "Knowledge Base" using cosine similarity on vectors, not just keywords.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Knowledge Base */}
                <div className="flex-1 glass-panel p-4 rounded-xl">
                    <h4 className="text-sm font-bold text-white mb-3">Knowledge Base</h4>
                    <div className="space-y-2">
                        {ragDB.map(item => (
                            <div key={item.id} className="bg-slate-800 p-2 rounded text-xs text-slate-300 border border-slate-700">
                                <span className="text-blue-400 font-bold mr-2">[{item.id}]</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Search Interface */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="glass-panel p-4 rounded-xl space-y-3">
                        <label className="text-xs text-slate-400 uppercase font-bold">User Query</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. How long is battery life?"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="glass-panel p-4 rounded-xl flex-1 border border-slate-700/50 min-h-[150px]">
                        <h4 className="text-xs text-slate-500 uppercase font-bold mb-2">Retrieved Context</h4>
                        {result ? (
                            <div className="animate-in slide-in-from-bottom-2">
                                {result.score > 0.6 ? (
                                    <div className="text-sm">
                                        <div className="text-green-400 font-bold mb-1">
                                            SEMANTIC MATCH (Score {result.score.toFixed(3)})
                                        </div>
                                        <div className="p-3 bg-green-900/20 border border-green-900/50 rounded text-green-100">
                                            "{result.best.text}"
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-red-400 mt-4">
                                        <div className="font-bold">NO MATCH FOUND</div>
                                        <div className="text-xs opacity-70">Max Score: {result.score.toFixed(3)}</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-slate-600 text-xs mt-10 italic">
                                Run a search to see results...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
