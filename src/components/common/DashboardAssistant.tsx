import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Bot, MessageCircle, RotateCw, Send, Sparkles, X } from 'lucide-react';
import './DashboardAssistant.css';

interface DashboardAssistantProps {
  lang: 'EN' | 'BN';
  onAsk: (question: string) => void;
}

const suggestions = [
  { en: 'How much did I spend this month?', bn: 'এই মাসে আমার খরচ কত?' },
  { en: 'Is this payment safe?', bn: 'এই পেমেন্টটি কি নিরাপদ?' },
  { en: 'Find my nearest cash-out point', bn: 'নিকটস্থ ক্যাশ-আউট পয়েন্ট খুঁজুন' },
  { en: 'How can I save ৳6,000 this month?', bn: 'এই মাসে ৳৬,০০০ কীভাবে সঞ্চয় করব?' },
];

export const DashboardAssistant: React.FC<DashboardAssistantProps> = ({ lang, onAsk }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const isBn = lang === 'BN';

  const submitQuestion = (event: FormEvent) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;
    onAsk(trimmedQuestion);
    setQuestion('');
    setIsOpen(false);
  };

  const askSuggestion = (prompt: string) => {
    onAsk(prompt);
    setIsOpen(false);
  };

  return (
    <div className="dashboard-assistant" data-open={isOpen}>
      {isOpen && (
        <section className="assistant-card" aria-label={isBn ? 'টাকা সেফ এআই সহকারী' : 'TakaSafe AI assistant'}>
          <div className="assistant-art" aria-hidden="true">
            <div className="assistant-orbit assistant-orbit-one" />
            <div className="assistant-orbit assistant-orbit-two" />
            <Sparkles className="assistant-sparkle assistant-sparkle-one" />
            <Sparkles className="assistant-sparkle assistant-sparkle-two" />
            <div className="assistant-robot">
              <div className="assistant-robot-antenna"><i /></div>
              <div className="assistant-robot-ear assistant-robot-ear-left" />
              <div className="assistant-robot-ear assistant-robot-ear-right" />
              <div className="assistant-robot-head">
                <div className="assistant-robot-face">
                  <i /><i /><span />
                </div>
              </div>
              <div className="assistant-robot-body"><span><Bot size={17} /></span></div>
              <div className="assistant-robot-arm assistant-robot-arm-left" />
              <div className="assistant-robot-arm assistant-robot-arm-right" />
            </div>
            <button type="button" className="assistant-reset" onClick={() => setQuestion('')} aria-label={isBn ? 'প্রশ্ন মুছুন' : 'Clear question'} title={isBn ? 'প্রশ্ন মুছুন' : 'Clear question'}>
              <RotateCw size={15} />
            </button>
          </div>

          <div className="assistant-content">
            <h2>{isBn ? 'টাকা Safe AI-কে জিজ্ঞাসা করুন' : 'Ask টাকা Safe AI'}</h2>
            <p>{isBn ? 'লেনদেন, খরচ এবং আরও অনেক বিষয়ে তাৎক্ষণিক উত্তর পান।' : 'Get instant answers about your transactions, spending, and more.'}</p>

            <div className="assistant-suggestions" aria-label={isBn ? 'প্রস্তাবিত প্রশ্ন' : 'Suggested questions'}>
              {suggestions.map((prompt) => (
                <button type="button" key={prompt.en} onClick={() => askSuggestion(prompt.en)}>
                  {isBn ? prompt.bn : prompt.en}
                </button>
              ))}
            </div>

            <form className="assistant-input" onSubmit={submitQuestion}>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder={isBn ? 'আপনার প্রশ্ন লিখুন...' : 'Type your question...'}
                aria-label={isBn ? 'আপনার প্রশ্ন লিখুন' : 'Type your question'}
              />
              <button type="submit" disabled={!question.trim()} aria-label={isBn ? 'পাঠান' : 'Send question'}>
                <Send size={17} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        className="assistant-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? (isBn ? 'সহকারী বন্ধ করুন' : 'Close assistant') : (isBn ? 'টাকা সেফ এআই খুলুন' : 'Open TakaSafe AI assistant')}
      >
        {isOpen ? <X size={21} /> : <><MessageCircle size={20} /><span className="assistant-launcher-spark"><Sparkles size={11} /></span></>}
      </button>
    </div>
  );
};
