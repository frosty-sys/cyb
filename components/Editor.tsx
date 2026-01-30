import React, { useState, useEffect } from 'react';
import { User, Project, ChatMessage } from '../types';
import { storage } from '../services/storage';
import { generateAppCode } from '../services/geminiService';
import { Send, Play, Save, ChevronLeft, Layout, Smartphone, Monitor } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EditorProps {
  project: Project;
  user: User;
  onBack: () => void;
}

const Editor: React.FC<EditorProps> = ({ project, user, onBack }) => {
  const [code, setCode] = useState(project.html);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'CODE'>('PREVIEW');
  const [previewKey, setPreviewKey] = useState(0); // Force iframe refresh

  const handleSave = () => {
    storage.saveProject({ ...project, html: code, updatedAt: Date.now() });
    alert('Project Saved!');
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    if (user.credits <= 0 && !user.isAdmin) {
      alert("Insufficient credits. Contact admin.");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isGenerating: true
    }]);

    try {
      await generateAppCode(
        userMsg.content,
        code,
        (textChunk) => {
           setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: m.content + textChunk } : m));
        },
        (generatedCode) => {
           setCode(generatedCode);
           setPreviewKey(prev => prev + 1); // Refresh preview
           // Auto-save generated code
           storage.saveProject({ ...project, html: generatedCode, updatedAt: Date.now() });
        }
      );
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: 'err', role: 'system', content: `Error: ${err.message}`, timestamp: Date.now() 
      }]);
    } finally {
      setIsGenerating(false);
      setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, isGenerating: false } : m));
      // Refresh credits locally display
      // Force update handled by parent or context usually, but simple reload works
      const u = storage.getSession(); // get updated credits
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar: AI Chat */}
      <div className="w-1/3 min-w-[350px] border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
           <button onClick={onBack} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-medium">
             <ChevronLeft size={16} /> Back
           </button>
           <span className="font-bold text-gray-700">CyberDoom Agent</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                 msg.role === 'user' 
                   ? 'bg-indigo-600 text-white rounded-br-none' 
                   : (msg.role === 'system' ? 'bg-red-100 text-red-800' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none')
               }`}>
                 {msg.role === 'model' && msg.content === '' && msg.isGenerating ? (
                   <span className="flex items-center gap-2">
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                     Thinking...
                   </span>
                 ) : (
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                 )}
               </div>
             </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
           <div className="relative">
             <textarea 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder={isGenerating ? "AI is generating..." : "Describe the app you want to build..."}
               disabled={isGenerating}
               className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-sm"
               onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
             />
             <button 
               onClick={handleSend}
               disabled={isGenerating || !input.trim()}
               className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition-colors"
             >
               <Send size={16} />
             </button>
           </div>
           <div className="text-center mt-2 text-xs text-gray-400">
             1 Prompt = 1 Credit
           </div>
        </div>
      </div>

      {/* Right Area: Code/Preview */}
      <div className="flex-1 flex flex-col bg-gray-100 relative">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
           <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('PREVIEW')} 
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'PREVIEW' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('CODE')} 
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'CODE' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              >
                Code
              </button>
           </div>
           
           <div className="flex items-center gap-2">
             <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded hover:bg-black transition-colors">
               <Save size={14} /> Save
             </button>
             <div className="w-px h-6 bg-gray-200 mx-2" />
             <div className="text-xs text-gray-400">
               {project.branch}
             </div>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'PREVIEW' && (
            <div className="w-full h-full flex flex-col">
              <div className="bg-gray-200 p-2 flex justify-center gap-4 border-b border-gray-300">
                 {/* Device Simulation Buttons (Visual Only) */}
                 <Monitor size={16} className="text-gray-600" />
                 <Smartphone size={16} className="text-gray-400" />
              </div>
              <iframe 
                key={previewKey}
                srcDoc={code} 
                className="w-full h-full bg-white"
                title="Preview"
                sandbox="allow-scripts allow-modals"
              />
            </div>
          )}

          {activeTab === 'CODE' && (
             <textarea 
               value={code}
               onChange={e => setCode(e.target.value)}
               className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 outline-none resize-none"
               spellCheck={false}
             />
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;