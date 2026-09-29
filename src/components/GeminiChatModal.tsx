import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Film, 
  Car, 
  Zap, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  RotateCcw, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

type BotRole = 'video_director' | 'cleaning_expert' | 'general_assistant';

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  currentLang
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('max_gemini_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<BotRole>('video_director');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('max_gemini_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [messages]);

  // Translations
  const t = {
    ua: {
      title: 'AI Асистент & Відеорежисер',
      subtitle: 'Multi-turn чат на базі Gemini (Shot List, B-Roll, Консультації)',
      roles: {
        video_director: '🎬 AI Режисер Відеомонтажу',
        cleaning_expert: '🧽 MaxExpert360 Детейлінг Про',
        general_assistant: '⚡ Швидкий AI Помічник'
      },
      roleDescriptions: {
        video_director: 'Створення монтажних планів (Shot list), таймкодів, B-Roll промптів для Veo/Runway, гачків та саунд-дизайну.',
        cleaning_expert: 'Консультації щодо складних плям, догляду за авто, розрахунку вартості та еко-засобів.',
        general_assistant: 'Універсальний інтелектуальний помічник для будь-яких питань.'
      },
      models: {
        'gemini-3.5-flash': 'Gemini 3.5 Flash (Швидкий & Розумний)',
        'gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite (Блискавичний)',
        'gemini-3.1-pro-preview': 'Gemini 3.1 Pro Preview (Глибокий аналіз)'
      },
      inputPlaceholder: 'Напишіть запит (наприклад: Склади монтажний план для 30-секундного ролика)...',
      sendBtn: 'Надіслати',
      clearChat: 'Очистити чат',
      exportChat: 'Завантажити діалог',
      quickPromptsTitle: 'Швидкі запити для старту:',
      quickPrompts: {
        video_director: [
          '🎬 Склади динамічний монтажний план на 30 сек (Shot List)',
          '🎥 Напиши промпти для AI відео-генератора B-Roll (Google Veo 3)',
          '⏱️ Розбий сценарій по секундах з типами планів та переходів',
          '🔥 Які 3 найкращі гачки (hooks) для перших 3 секунд відео?',
          '🎞️ Сформуй таймлайн у форматі JSON для Adobe Premiere Pro / DaVinci'
        ],
        cleaning_expert: [
          '🚗 Як ефективно видалити зимовий білий сольовий наліт з ковроліну?',
          '☕ Чим вивести застарілу пляму від кави зі світлого тканинного дивана?',
          '🛋️ Як часто рекомендується проводити антибактеріальну хімчистку матраца?',
          '💲 Які послуги входять у повний пакет детейлінгу автосалону?'
        ],
        general_assistant: [
          '💡 Порадь ідеї для вірусного відеоконтенту в соцмережах',
          '📝 Допоможи написати чіткий сценарій для комерційної презентації',
          '⚡ Як структурувати робочий день для максимальної продуктивності?'
        ]
      },
      welcomeGreeting: 'Привіт! Я ваш персональний AI-асистент. Оберіть режим (Відеомонтаж або Детейлінг) і поставте будь-яке запитання!',
      copied: 'Скопійовано!',
      copy: 'Копіювати',
      thinking: 'Gemini генерує відповідь...'
    },
    fr: {
      title: 'Assistant IA & Réalisateur Vidéo',
      subtitle: 'Chat interactif multi-tours alimenté par Gemini',
      roles: {
        video_director: '🎬 Réalisateur Vidéo & Montage IA',
        cleaning_expert: '🧽 Expert Nettoyage MaxExpert360',
        general_assistant: '⚡ Assistant IA Général'
      },
      roleDescriptions: {
        video_director: 'Plans de tournage, timecodes, prompts B-Roll pour Veo/Runway, accroches et sound design.',
        cleaning_expert: 'Conseils pour taches tenaces, entretien auto, meubles et produits 100% écologiques.',
        general_assistant: 'Assistant intelligent pour toutes vos questions générales.'
      },
      models: {
        'gemini-3.5-flash': 'Gemini 3.5 Flash (Équilibré & Rapide)',
        'gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite (Ultra-rapide)',
        'gemini-3.1-pro-preview': 'Gemini 3.1 Pro Preview (Raisonnement avancé)'
      },
      inputPlaceholder: 'Posez votre question ou demandez un plan de montage...',
      sendBtn: 'Envoyer',
      clearChat: 'Effacer',
      exportChat: 'Télécharger',
      quickPromptsTitle: 'Suggestions rapides :',
      quickPrompts: {
        video_director: [
          '🎬 Crée un plan de montage dynamique de 30s (Shot List)',
          '🎥 Rédige des prompts optimisés pour B-Roll IA (Google Veo 3)',
          '🔥 Quelles sont les meilleures accroches (hooks) pour les 3 premières secondes ?',
          '🎞️ Génère une structure de timeline au format JSON pour DaVinci Resolve'
        ],
        cleaning_expert: [
          '🚗 Comment éliminer les cernes de sel et calcaire d\'hiver sur les tapis auto ?',
          '☕ Comment enlever une tache de café sur un canapé en tissu clair ?',
          '💲 Quels sont les tarifs pour un nettoyage complet d\'intérieur de VUS ?'
        ],
        general_assistant: [
          '💡 Donne-moi des idées pour améliorer l\'engagement sur mes vidéos',
          '📝 Rédige un script percutant pour une vidéo de présentation'
        ]
      },
      welcomeGreeting: 'Bonjour ! Je suis votre assistant IA Gemini. Sélectionnez un rôle et posez-moi vos questions !',
      copied: 'Copié !',
      copy: 'Copier',
      thinking: 'Gemini réfléchit...'
    },
    en: {
      title: 'AI Assistant & Video Director',
      subtitle: 'Multi-turn Chat powered by Gemini (Shot List, B-Roll, Cleaning Tips)',
      roles: {
        video_director: '🎬 AI Video Director & Editor',
        cleaning_expert: '🧽 MaxExpert360 Detailing Pro',
        general_assistant: '⚡ Fast AI Assistant'
      },
      roleDescriptions: {
        video_director: 'Shot lists, timeline breakdown, B-roll prompts for Veo/Runway, hooks, and sound design.',
        cleaning_expert: 'Expert tips on stubborn stains, vehicle interior care, pricing, and eco-friendly products.',
        general_assistant: 'Versatile AI assistant ready to help with any task.'
      },
      models: {
        'gemini-3.5-flash': 'Gemini 3.5 Flash (Balanced & Fast)',
        'gemini-3.1-flash-lite': 'Gemini 3.1 Flash Lite (Ultra-fast)',
        'gemini-3.1-pro-preview': 'Gemini 3.1 Pro Preview (Deep Reasoning)'
      },
      inputPlaceholder: 'Ask a question or request a shot list / B-roll prompts...',
      sendBtn: 'Send',
      clearChat: 'Clear',
      exportChat: 'Export',
      quickPromptsTitle: 'Quick starter suggestions:',
      quickPrompts: {
        video_director: [
          '🎬 Create a dynamic 30-sec video shot list with transitions',
          '🎥 Generate cinematic B-roll prompts for Google Veo 3',
          '🔥 What are the top 3 high-retention hooks for the first 3 seconds?',
          '🎞️ Format a structured timeline in JSON for Premiere Pro / DaVinci'
        ],
        cleaning_expert: [
          '🚗 How to remove winter calcium salt stains from car carpets?',
          '☕ How to clean an old coffee stain from a light fabric sofa?',
          '💲 What is included in the full interior SUV mobile detailing package?'
        ],
        general_assistant: [
          '💡 Give me creative ideas to increase audience retention on short-form video',
          '📝 Help me outline a compelling script for a local service ad'
        ]
      },
      welcomeGreeting: 'Hello! I am your Gemini AI assistant. Select a role and ask anything!',
      copied: 'Copied!',
      copy: 'Copy',
      thinking: 'Gemini is generating...'
    }
  }[currentLang];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    setInput('');

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Prepare payload for multi-turn server endpoint
      const payloadMessages = updatedHistory.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: payloadMessages,
          role: selectedRole,
          model: selectedModel,
          language: currentLang
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Помилка звернення до Gemini API');
      }

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Не вдалося отримати відповідь від сервера.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm(currentLang === 'ua' ? 'Очистити історію листування?' : 'Effacer l’historique de conversation ?')) {
      setMessages([]);
      localStorage.removeItem('max_gemini_chat_history');
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const conversationText = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'Користувач' : 'Gemini AI Bot'}:\n${m.text}\n`)
      .join('\n-------------------------\n\n');

    const blob = new Blob([conversationText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-chat-${selectedRole}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#D5EAD9] rounded-2xl sm:rounded-3xl w-full max-w-4xl h-[92vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden text-[#122B1E] relative">
        
        {/* Top Header */}
        <div className="bg-[#EAF6EE] px-4 py-3 sm:px-6 sm:py-4 border-b border-[#D5EAD9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shadow-xs shrink-0">
              {selectedRole === 'video_director' ? (
                <Film className="w-5 h-5 text-[#16A34A]" />
              ) : selectedRole === 'cleaning_expert' ? (
                <Car className="w-5 h-5 text-[#16A34A]" />
              ) : (
                <Bot className="w-5 h-5 text-[#16A34A]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-sm sm:text-base text-[#0D2818] uppercase tracking-tight">
                  {t.title}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3 Series
                </span>
              </div>
              <p className="text-xs text-[#3E6552] truncate max-w-xs sm:max-w-md">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportChat}
                  title={t.exportChat}
                  className="p-2 rounded-xl text-[#3E6552] hover:text-[#0D2818] hover:bg-white border border-transparent hover:border-[#D5EAD9] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  title={t.clearChat}
                  className="p-2 rounded-xl text-[#A34B4B] hover:text-[#991B1B] hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-[#F4FAF6] text-[#4F7A64] hover:text-[#0D2818] border border-[#D5EAD9] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Roles & Model Toolbar */}
        <div className="bg-[#F8FCF9] px-4 py-2.5 sm:px-6 border-b border-[#D5EAD9] flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          {/* Role selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-[11px] font-bold text-[#4F7A64] uppercase font-mono mr-1 hidden sm:inline">
              Роль:
            </span>
            {(['video_director', 'cleaning_expert', 'general_assistant'] as BotRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedRole === r
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : 'bg-white text-[#2C523D] border border-[#D5EAD9] hover:border-[#16A34A]'
                }`}
              >
                {r === 'video_director' && <Film className="w-3.5 h-3.5" />}
                {r === 'cleaning_expert' && <Car className="w-3.5 h-3.5" />}
                {r === 'general_assistant' && <Zap className="w-3.5 h-3.5" />}
                <span>{t.roles[r]}</span>
              </button>
            ))}
          </div>

          {/* Model selection dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-[#4F7A64] uppercase font-mono hidden md:inline">
              Модель:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white border border-[#D5EAD9] text-[#0D2818] rounded-xl px-2.5 py-1.5 text-xs font-medium focus:border-[#16A34A] focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Стандарт)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Швидкий)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Глибокий)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white to-[#F8FCF9]">
          
          {/* Welcome Card if no messages */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-4 sm:py-6 space-y-5 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#EAF6EE] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] mx-auto shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-heading font-black text-lg sm:text-xl text-[#0D2818] uppercase">
                  {t.roles[selectedRole]}
                </h4>
                <p className="text-xs sm:text-sm text-[#3E6552] max-w-md mx-auto leading-relaxed">
                  {t.roleDescriptions[selectedRole]}
                </p>
              </div>

              {/* Quick suggestions */}
              <div className="pt-2 text-left bg-white p-4 rounded-2xl border border-[#D5EAD9] shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#15803D] font-bold block mb-2">
                  {t.quickPromptsTitle}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.quickPrompts[selectedRole].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs p-2.5 rounded-xl bg-[#F4FAF6] hover:bg-[#EAF6EE] border border-[#D5EAD9] hover:border-[#16A34A] text-[#0D2818] transition-all cursor-pointer font-medium hover:translate-x-0.5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#EAF6EE] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1 max-w-[88%] sm:max-w-[80%]">
                  <div
                    className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#16A34A] text-white rounded-tr-none'
                        : 'bg-white text-[#122B1E] border border-[#D5EAD9] rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Metadata & Actions */}
                  <div className={`flex items-center gap-2 px-1 text-[10px] text-[#719B84] ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="font-mono bg-[#EAF6EE] text-[#15803D] px-1.5 py-0.5 rounded">
                        {msg.modelUsed}
                      </span>
                    )}

                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="hover:text-[#0D2818] transition-colors cursor-pointer flex items-center gap-1 font-mono"
                        title={t.copy}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span className="text-[#16A34A]">{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t.copy}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#0D2818] flex items-center justify-center text-white shrink-0 mt-1 font-bold text-xs">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-md animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#EAF6EE] border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0 mt-1">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-[#D5EAD9] rounded-2xl rounded-tl-none p-3.5 text-xs text-[#3E6552] flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-bounce"></span>
                </div>
                <span>{t.thinking}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="font-bold underline cursor-pointer ml-2"
              >
                Повторити
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-white px-3 py-3 sm:px-6 sm:py-4 border-t border-[#D5EAD9] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-[#F8FCF9] border border-[#D5EAD9] rounded-2xl p-2 focus-within:border-[#16A34A] focus-within:bg-white transition-colors shadow-xs">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
                rows={1}
                className="w-full bg-transparent resize-none outline-none text-xs sm:text-sm text-[#0D2818] placeholder-[#7E9F8E] max-h-32 leading-relaxed px-1"
                style={{ minHeight: '24px' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] disabled:bg-[#D5EAD9] disabled:text-[#8BAAA0] disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#16A34A]/25 flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.sendBtn}</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-[#78A18B] mt-2 px-1">
            <span className="hidden sm:inline">
              Enter — надіслати, Shift + Enter — новий рядок
            </span>
            <span className="font-mono text-[10px] ml-auto">
              Multi-Turn Gemini Engine • {selectedModel}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
