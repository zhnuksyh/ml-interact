import { useState } from 'react';
import Sidebar from './components/Sidebar';

// Module Imports
import HomeModule from './modules/HomeModule';
import ChunkingModule from './modules/ChunkingModule';
import EmbeddingModule from './modules/EmbeddingModule';
import RAGModule from './modules/RAGModule';
import QuantizationModule from './modules/QuantizationModule';
import PipelineModule from './modules/PipelineModule';
import LLMModule from './modules/LLMModule';
import InferenceModule from './modules/InferenceModule';
import OCRModule from './modules/OCRModule';
import MCPModule from './modules/MCPModule';

const TITLE_MAP = {
  'home': 'Overview',
  'chunking': 'Chunking',
  'embedding': 'Embeddings',
  'rag': 'Vector Search',
  'quantization': 'Quantization',
  'pipeline': 'Full Pipeline',
  'llm': 'LLM Basics',
  'inference': 'Inference',
  'ocr': 'Vision / OCR',
  'mcp': 'MCP / Tools'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderModule = () => {
    switch (activeTab) {
      case 'home': return <HomeModule onNavigate={setActiveTab} />;
      case 'chunking': return <ChunkingModule />;
      case 'embedding': return <EmbeddingModule />;
      case 'rag': return <RAGModule />;
      case 'quantization': return <QuantizationModule />;
      case 'pipeline': return <PipelineModule />;
      case 'llm': return <LLMModule />;
      case 'inference': return <InferenceModule />;
      case 'ocr': return <OCRModule />;
      case 'mcp': return <MCPModule />;
      default: return <HomeModule onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0b0f19] text-slate-200 font-sans overflow-hidden">
      <Sidebar activeTab={activeTab} onSwitch={setActiveTab} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <div className="h-16 border-b border-slate-800 flex items-center px-6 bg-[#0b0f19]/80 backdrop-blur">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            {TITLE_MAP[activeTab] || 'Overview'}
          </h2>
        </div>

        {/* Module Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-5xl mx-auto pb-12">
            {renderModule()}
          </div>
        </div>
      </main>
    </div>
  );
}
