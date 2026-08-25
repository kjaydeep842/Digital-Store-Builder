'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, Database, MessageSquare, Share2, Search, Copy, Check } from 'lucide-react';
import { askShopAiAction, generateAiMarketingCopyAction } from '@/app/actions/ai-assistant';

interface AiAssistantClientProps {
  store: any;
}

export default function AiAssistantClient({ store }: AiAssistantClientProps) {
  const [activeTab, setActiveTab] = useState<'ASSISTANT' | 'MARKETING'>('ASSISTANT');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string; dataType?: string }>>([
    {
      sender: 'AI',
      text: `Hello ${store.ownerName}! I am **ShopAI**, your AI business employee for ${store.name}. Ask me anything about your products, sales, inventory restock, or marketing campaign creation!`,
      dataType: 'CALCULATED_DATA'
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Marketing Copy Generator State
  const [marketingType, setMarketingType] = useState<'WHATSAPP' | 'INSTAGRAM' | 'SEO' | 'BANNER'>('WHATSAPP');
  const [generatedCopy, setGeneratedCopy] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleQuestions = [
    "Which products are selling best?",
    "What should I restock?",
    "Which customers haven't ordered recently?",
    "Create a weekend offer for inactive customers",
    "Show me today's profit summary"
  ];

  const handleSendQuestion = async (qText?: string) => {
    const textToAsk = qText || question;
    if (!textToAsk.trim()) return;

    setMessages(prev => [...prev, { sender: 'USER', text: textToAsk }]);
    setQuestion('');
    setLoading(true);

    const res = await askShopAiAction(store.id, textToAsk);
    setLoading(false);

    if (res.success && res.answer) {
      setMessages(prev => [...prev, { sender: 'AI', text: res.answer, dataType: res.dataType }]);
    } else {
      setMessages(prev => [...prev, { sender: 'AI', text: '⚠️ Unable to process question. Please try again.' }]);
    }
  };

  const handleGenerateMarketingCopy = async (type: 'WHATSAPP' | 'INSTAGRAM' | 'SEO' | 'BANNER') => {
    setMarketingType(type);
    setLoading(true);
    const res = await generateAiMarketingCopyAction(store.id, type);
    setLoading(false);
    if (res.success && res.copy) {
      setGeneratedCopy(res.copy);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-400" />
            <span>AI Business Assistant & Marketing Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Real-time database analysis + automated copy creation.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ASSISTANT')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'ASSISTANT' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>ShopAI Assistant</span>
          </button>
          <button
            onClick={() => setActiveTab('MARKETING')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'MARKETING' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Marketing Copy</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ShopAI Assistant */}
      {activeTab === 'ASSISTANT' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col h-[600px] justify-between space-y-4">
          {/* Sample Questions Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 text-xs">
            <span className="text-slate-400 font-bold whitespace-nowrap">Try asking:</span>
            {sampleQuestions.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuestion(sq)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold whitespace-nowrap transition text-[11px]"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'AI' && (
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-lg space-y-2 ${
                    msg.sender === 'USER'
                      ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.dataType && msg.sender === 'AI' && (
                    <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-800">
                      {msg.dataType === 'CALCULATED_DATA' ? '📊 Live DB Calculation' : '💡 AI Recommendation'}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask ShopAI about products, sales, restock, or campaigns..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendQuestion()}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleSendQuestion()}
              disabled={loading || !question.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AI Marketing Copy Generator */}
      {activeTab === 'MARKETING' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div>
            <h3 className="text-xl font-extrabold text-white">AI Marketing Copy Generator</h3>
            <p className="text-xs text-slate-400 mt-1">Select channel to generate customized promotional text based on your store profile.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
            <button
              onClick={() => handleGenerateMarketingCopy('WHATSAPP')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left space-y-2 group"
            >
              <MessageSquare className="h-5 w-5 text-emerald-400" />
              <span className="block text-white">WhatsApp Broadcast</span>
            </button>

            <button
              onClick={() => handleGenerateMarketingCopy('INSTAGRAM')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left space-y-2 group"
            >
              <Share2 className="h-5 w-5 text-purple-400" />
              <span className="block text-white">Instagram Caption</span>
            </button>

            <button
              onClick={() => handleGenerateMarketingCopy('SEO')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left space-y-2 group"
            >
              <Search className="h-5 w-5 text-indigo-400" />
              <span className="block text-white">Google SEO Meta</span>
            </button>

            <button
              onClick={() => handleGenerateMarketingCopy('BANNER')}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-teal-500 text-left space-y-2 group"
            >
              <Sparkles className="h-5 w-5 text-teal-400" />
              <span className="block text-white">Banner Tagline</span>
            </button>
          </div>

          {generatedCopy && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Generated {marketingType} Copy:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCopy);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1 hover:bg-slate-700"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{generatedCopy}</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
