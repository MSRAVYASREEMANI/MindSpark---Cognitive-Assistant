import React, { useState, useEffect } from 'react';
import { UserProfile, ReminderItem } from '../types';
import { speakText, stopSpeaking } from '../utils/audio';
import { getTranslation } from '../utils/translations';
import { getLanguageByCode } from '../utils/languages';

interface SparkyAssistantModalProps {
  userProfile: UserProfile;
  reminders: ReminderItem[];
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'sparky' | 'user';
  text: string;
  timestamp: string;
}

export const SparkyAssistantModal: React.FC<SparkyAssistantModalProps> = ({
  userProfile,
  reminders,
  onClose,
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('Connected');
  const t = getTranslation(userProfile.language);
  const langConfig = getLanguageByCode(userProfile.language);

  const getInitialGreeting = () => {
    switch (userProfile.language) {
      case 'assamese':
        return `নমস্কাৰ ${userProfile.name}! মই স্পাৰ্কী, আপোনাৰ সহায়ক। মই আপোনাৰ লগত আছোঁ। আপুনি কেনে অনুভৱ কৰিছে?`;
      case 'bengali':
        return `নমস্কার ${userProfile.name}! আমি স্পার্কি, আপনার সঙ্গী। আমি আপনার সাথেই আছি। আপনি এখন কেমন আছেন?`;
      case 'hindi':
        return `नमस्ते ${userProfile.name}! मैं स्पार्की हूँ, आपका साथी। मैं आपके साथ हूँ। आज आप कैसा महसूस कर रहे हैं?`;
      case 'telugu':
        return `నమస్కారం ${userProfile.name}! నేను స్పార్కీ, మీ సహాయకుడిని. నేను మీతోనే ఉన్నాను. మీరు ఎలా ఉన్నారు?`;
      case 'nepali':
        return `नमस्ते ${userProfile.name}! म स्पार्की हुँ, तपाईंको साथी। म तपाईंसँगै छु। आज तपाईंलाई कस्तो छ?`;
      case 'bodo':
        return `खुलुमबाय ${userProfile.name}! आं स्पार्की, नोंथांनि लोगो। आं नोंथांनि लोगोआवनो दं। नोंथाङा दिनै माबोरै दं?`;
      case 'meitei':
        return `খোৰুমজৰি ${userProfile.name}! ঐ স্পার্কীনি, অদোমগী মরুপনি। ঐ অদোমগা লোয়ননা লৈরি। অদোমসি কমদৌৰিবগে?`;
      case 'mizo':
        return `Chibai ${userProfile.name}! Sparky ka ni e. I kiangah ka awm reng a nia. Vawiin i tha em?`;
      case 'khasi':
        return `Khublei ${userProfile.name}! Nga dei u Sparky. Nga don bad phi. Kumno phi long mynta?`;
      case 'garo':
        return `Salam ${userProfile.name}! Anga Sparky ong·a. Anga nang·baksa dong·a. Da·alo nambatokama?`;
      case 'kokborok':
        return `Khulumkha ${userProfile.name}! Ang Sparky, nini logi. Ang nini logi-o tongkho. Nung baha hai tong?`;
      case 'nagamese':
        return `Kene ase ${userProfile.name}! Moi Sparky ase, apuni logote ase. Aji apuni bhal ase na?`;
      case 'nyishi':
        return `Donyi Polo ${userProfile.name}! Ngo Sparky. No doolo hapa dolo?`;
      default:
        return `Hello ${userProfile.name}! I'm Sparky, your companion. I'm right here with you in Guwahati. How are you feeling right now?`;
    }
  };

  const initialGreeting = getInitialGreeting();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'sparky',
      text: initialGreeting,
      timestamp: 'Just now',
    },
  ]);

  useEffect(() => {
    // Speak initial greeting gently in user's chosen language
    speakText(
      initialGreeting,
      undefined,
      userProfile.language,
      userProfile.speechRate,
      userProfile.speechPitch
    );
    return () => {
      stopSpeaking();
    };
  }, [userProfile.name, userProfile.language]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: userProfile.language,
          userProfile: {
            name: userProfile.name,
            age: userProfile.age,
            city: userProfile.city,
            state: userProfile.state,
            caregiverName: userProfile.caregiverName,
            language: userProfile.language,
            emergencyContacts: userProfile.emergencyContacts,
          },
          context: {
            overdueReminder: reminders.find((r) => r.status === 'overdue')?.title,
            upcomingReminder: reminders.find((r) => r.status === 'upcoming')?.title,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || `I am right here with you, ${userProfile.name}. Everything is peaceful.`;
        setAiSource(data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Compassion Engine');

        const sparkyMsg: Message = {
          id: `s-${Date.now()}`,
          sender: 'sparky',
          text: replyText,
          timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, sparkyMsg]);
        speakText(
          replyText,
          undefined,
          userProfile.language,
          userProfile.speechRate,
          userProfile.speechPitch
        );
      } else {
        throw new Error('API request failed');
      }
    } catch {
      // Reassuring local fallback
      const lower = query.toLowerCase();
      let fallback = `I am here with you, ${userProfile.name}. You are doing wonderfully today in Guwahati. Take a slow, deep breath. We have plenty of time.`;

      if (lower.includes('sarah') || lower.includes('daughter') || lower.includes('চাৰাহ') || lower.includes('सारा')) {
        fallback = 'Sarah is your eldest daughter who lives in Shillong, Meghalaya. She loves gardening and is calling you on video at 2:00 PM today.';
      } else if (lower.includes('who is david') || lower.includes('david') || lower.includes('দেৱিদ') || lower.includes('डेविड')) {
        fallback = 'David is your 22-year-old grandson studying in Guwahati. He loves playing chess and drinking Assam tea with you.';
      } else if (lower.includes('where am i') || lower.includes('home') || lower.includes('place') || lower.includes('ক’ত') || lower.includes('कहाँ')) {
        fallback = `You are safely at home in your cozy residence in Uzan Bazar, Guwahati, Assam. Everything is calm, peaceful, and secure.`;
      }

      const fallbackMsg: Message = {
        id: `s-${Date.now()}`,
        sender: 'sparky',
        text: fallback,
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(
        fallback,
        undefined,
        userProfile.language,
        userProfile.speechRate,
        userProfile.speechPitch
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.lang = langConfig.speechCode || 'en-IN';
      recognition.interimResults = false;
      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      handleSend("Who is Sarah?");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#f8f9fc] dark:bg-[#191c1e] rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-white/60 dark:border-white/10 flex flex-col h-[85vh] max-h-[750px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e1e2e5] dark:border-[#282a2d]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[26px]">record_voice_over</span>
            </div>
            <div>
              <h2 className="font-bold text-2xl text-[#003c53] dark:text-[#94cef0]">
                {t.talkToSparky}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="material-symbols-outlined text-[15px]">graphic_eq</span>
                  <span>{langConfig.name} • Voice Guidance Active</span>
                </p>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#abdefe]/30 dark:bg-[#104c67]/40 text-[#003c53] dark:text-[#94cef0]">
                  {aiSource}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-[#edeef0] dark:bg-[#282a2d] flex items-center justify-center text-[#71787e] hover:text-[#191c1e] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((msg) => {
            const isSparky = msg.sender === 'sparky';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isSparky ? 'items-start' : 'items-end justify-end'}`}
              >
                {isSparky && (
                  <div className="w-9 h-9 rounded-full bg-[#abdefe] dark:bg-[#104c67] text-[#003c53] dark:text-[#94cef0] flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-base md:text-lg leading-relaxed shadow-sm ${
                    isSparky
                      ? 'bg-white dark:bg-[#282a2d] text-[#191c1e] dark:text-white rounded-tl-sm border border-[#e1e2e5]/60 dark:border-white/5'
                      : 'bg-[#003c53] text-white rounded-br-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-[#abdefe] dark:bg-[#104c67] text-[#003c53] dark:text-[#94cef0] flex items-center justify-center shrink-0 shadow-sm mt-1">
                <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
              </div>
              <div className="bg-white dark:bg-[#282a2d] rounded-2xl p-4 rounded-tl-sm border border-[#e1e2e5]/60 dark:border-white/5 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#003c53] dark:bg-[#94cef0] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#003c53] dark:bg-[#94cef0] animate-bounce delay-150"></span>
                <span className="w-2 h-2 rounded-full bg-[#003c53] dark:bg-[#94cef0] animate-bounce delay-300"></span>
                <span className="text-xs text-[#71787e] ml-2 font-medium">Sparky is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex flex-wrap gap-2 overflow-x-auto">
          {[
            'Who is Sarah?',
            'What is next on my schedule?',
            'Tell me about my garden in Assam',
            'Where am I?',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="px-3.5 py-1.5 rounded-full bg-white dark:bg-[#282a2d] text-xs font-semibold text-[#003c53] dark:text-[#94cef0] border border-[#c0c7ce]/50 hover:bg-[#abdefe]/20 shadow-sm transition-all whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-3 flex items-center gap-3">
          <button
            onClick={handleVoiceToggle}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? 'bg-[#ba1a1a] text-white animate-pulse shadow-lg ring-4 ring-red-300'
                : 'bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] shadow-neu-extruded hover:scale-105'
            }`}
            title="Speak into microphone"
          >
            <span className="material-symbols-outlined text-[26px]">
              {isListening ? 'mic' : 'mic'}
            </span>
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening to your voice..." : `${t.startSpeaking}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-5 h-14 rounded-2xl bg-white dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#003c53]"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim()}
            className="w-14 h-14 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] flex items-center justify-center shadow-neu-extruded disabled:opacity-40 hover:scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
