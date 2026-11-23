import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { 
  MessageSquare, 
  X, 
  Send, 
  Wrench, 
  Truck, 
  HelpCircle, 
  Sparkles, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';

export const SupportChat: React.FC = () => {
  const { openBookingWithService, setActiveTab } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_1',
      sender: 'assistant',
      senderName: 'Jānis (VentVelo galvenais meistars)',
      text: 'Čau! Esmu Jānis no VentVelo darbnīcas (strādājam Ventspilī jau 18 gadus!). Kā varu palīdzēt – meklē jaunu MTB, Gravel, pilsētas vai bērnu riteni, interesē salikšana par €35 ar garantiju, līzings vai servisa busiņš?',
      timestamp: 'Tikko',
      quickReplies: [
        'Kaste €0 vai salikts €35?',
        'Vecais ritenis kā pirmā iemaksa',
        'Inbank un ESTO līzings',
        'Kā darbojas servisa busiņš?',
      ],
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      senderName: 'Tu',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateMechanicAnswer(query);
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        senderName: 'Jānis (VentVelo)',
        text: reply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: reply.quickReplies,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  const generateMechanicAnswer = (query: string): { text: string; quickReplies?: string[] } => {
    const q = query.toLowerCase();

    if (q.includes('nom') || q.includes('īr') || q.includes('iznomāt') || q.includes('rent')) {
      return {
        text: 'VentVelo piedāvā arī koptu velosipēdu nomu Rindas ielā 44 vai ar piegādi uz Usmas ezeru, Talsiem un Ventspils adresēm!\n• Pilsētas ritenis: no €7 / 3 st. vai €12 / dienā\n• Kalnu (MTB): no €9 / 3 st. vai €15 / dienā\n• Gravel: no €14 / 3 st. vai €22 / dienā\n• Bērnu ritenis: no €5 / 3 st. vai €9 / dienā\n• E-Velosipēds Bosch: €35 / dienā\nĶivere, slēdzene un lukturi iekļauti bez maksas!',
        quickReplies: ['Atvērt velosipēdu nomu', 'Pieteikt servisa busiņu'],
      };
    }

    if (q.includes('kast') || q.includes('salik') || q.includes('mont') || q.includes('35')) {
      return {
        text: 'Piedāvājam divus velosipēda saņemšanas veidus:\n1. Oriģinālajā iepakojumā (kastē) par €0 – pašam jāsamontē un jānoregulē, taču šajā variantā bez darbnīcas garantijas.\n2. Meistara pilnībā salikts un noregulēts par €35 – ar oficiālu 24 mēnešu garantiju, bremžu un pārslēdzēju pārbaudi, kā arī piegādi ar mūsu busiņu vai gatavu saņemšanai Rindas ielā 44!',
        quickReplies: ['Skatīt velosipēdus', 'Inbank un ESTO līzings'],
      };
    }

    if (q.includes('vec') || q.includes('iemaks') || q.includes('maiņ') || q.includes('novērt')) {
      return {
        text: 'Jā! Savu veco velosipēdu vari atdot mums kā pirmo iemaksu jaunā riteņa iegādei. Rindas ielā 44 novērtēsim tā stāvokli 15 minūšu laikā un uzreiz samazināsim jaunā DRAG, Fuji vai Adriatica riteņa cenu vai pirmo iemaksu līzingā.',
        quickReplies: ['Skatīt velosipēdus', 'Inbank un ESTO līzings'],
      };
    }

    if (q.includes('inbank') || q.includes('esto') || q.includes('līzing') || q.includes('nomaks')) {
      return {
        text: 'Visus jaunos velosipēdus (kalnu MTB, gravel, pilsētas un bērnu) vari iegādāties ar ērtu Inbank vai ESTO līzingu:\n• ESTO 3 – sadali maksājumu 3 daļās bez procentiem (€0 pārmaksa).\n• Inbank un ESTO nomaksa no 6 līdz 36 mēnešiem.\nPlus – vari izmantot arī veco riteni kā pirmo iemaksu!',
        quickReplies: ['Skatīt velosipēdus', 'Vecais ritenis kā pirmā iemaksa'],
      };
    }

    if (q.includes('buss') || q.includes('busiņ') || q.includes('savāk') || q.includes('usm') || q.includes('tals') || q.includes('piegād') || q.includes('van')) {
      return {
        text: 'Mūsu aprīkotais Mercedes Sprinter servisa buss regulāri apkalpo Ventspili (katru darba dienu), Usmas ezera apkārtni (pirmdienās, trešdienās, piektdienās) un Talsu novadu (otrdienās un ceturtdienās). Savācam ričuku tieši pie durvīm un atvedam atpakaļ gatavu braukšanai!\n\nBrauciena maksa: Ventspilī €8 (virs €50 bez maksas), Usmā €18 (virs €120 bez maksas), Talsos €22 (virs €150 bez maksas).',
        quickReplies: ['Pieteikt servisa busiņu', 'Skatīt pakalpojumu cenas'],
      };
    }

    if (q.includes('ķēd') || q.includes('lec') || q.includes('ātrum') || q.includes('pārslēdz') || q.includes('zobrat')) {
      return {
        text: 'Ja ķēde lec pie stiprāka uzspiediena, parasti ķēde ir izstiepusies vai ieliekta pārslēdzēja auss. Mūsu Standarta apkopē (€59) un Kapitālajā remontā (€119) visu iztaisnojam un noregulējam. VentVelo darbnīcā strādājam jau 18 gadus!',
        quickReplies: ['Pieteikt Standarta apkopi', 'Darbnīcas adrese un darba laiks'],
      };
    }

    if (q.includes('darba laik') || q.includes('laik') || q.includes('adres') || q.includes('kur atrodaties') || q.includes('filiāl') || q.includes('18')) {
      return {
        text: 'VentVelo strādā Ventspilī jau 18 gadus (kopš 2008. gada)! Mūsu darbnīca un velosalons atrodas Ventspilī, Rindas ielā 44 (Pārventā).\nDarba laiks: Pirmd.–Piektd. 10:00–18:00 (Sestd. 10:00–15:00), tālr. +371 27583888.',
        quickReplies: ['Pieteikt servisa busiņu', 'Skatīt velosipēdus'],
      };
    }

    if (q.includes('garantij') || q.includes('drošīb') || q.includes('sertifikāt')) {
      return {
        text: 'Izvēloties meistara saliktu velosipēdu par €35, saņem 24 mēnešu garantiju un gatavu braucamo. Pasūtot velosipēdu oriģinālajā kastē (€0), montāža jāveic pašam un garantija netiek nodrošināta. Remontdarbiem dodam 2 līdz 12 mēnešu garantiju.',
        quickReplies: ['Skatīt velosipēdus', 'Pieteikt apkopi'],
      };
    }

    if (q.includes('cen') || q.includes('maksā') || q.includes('izmak')) {
      return {
        text: 'Darbu izcenojumi ir skaidri un noapaļoti bez centiem:\n• Sezonas drošības apkope: €29\n• Standarta pilnā apkope: €59 (populārākā izvēle)\n• Kapitālais remonts un pārlasīšana: €119\n• E-skrejriteņu un elektrovelo diagnostika: €49\nJauniem velosipēdiem salikšana ar garantiju: +€35.',
        quickReplies: ['Pieteikt servisu tagad', 'Par servisa busiņu'],
      };
    }

    if (q.includes('skrejrit') || q.includes('baterij') || q.includes('xiaomi') || q.includes('bosch') || q.includes('elektro')) {
      return {
        text: 'Jā, mēs esam sertificēti Bosch, Shimano STEPS un Bafang e-velo sistēmām, kā arī apkalpojam Xiaomi un Segway e-skrejriteņus. Pārbaudām šūnu sprieguma līdzsvaru un atjaunojam mitruma aizsardzību.',
        quickReplies: ['Pieteikt e-skrejriteņa pārbaudi', 'Skatīt elektrovelo'],
      };
    }

    return {
      text: 'Paldies par jautājumu! VentVelo darbojas jau 18 gadus Ventspilī, Rindas ielā 44. Piedāvājam jaunus velosipēdus ar Inbank un ESTO līzingu, velosipēdu nomu un pilnu servisu ar busiņu Kurzemē.',
      quickReplies: ['Kaste €0 vai salikts €35?', 'Velosipēdi pārdošanā', 'Velosipēdu noma'],
    };
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-stone-900 hover:bg-stone-800 text-white p-3.5 rounded-full shadow-xl border border-stone-700 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          aria-label="Atvērt VentVelo darbnīcas čatu"
        >
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">Jautā meistaram Jānim</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-96 max-w-sm h-[520px] bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                VV
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-heading">VentVelo meistara galds</h3>
                <p className="text-[11px] text-amber-400">
                  Jānis Bērziņš · 18 gadu pieredze
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-stone-50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.senderName} · {msg.timestamp}
                </span>

                {/* Quick replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.quickReplies.map((qr, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (qr === 'Pieteikt servisa busiņu' || qr === 'Pieteikt Standarta apkopi' || qr === 'Pieteikt servisu tagad' || qr === 'Pieteikt e-skrejriteņa pārbaudi' || qr === 'Pieteikt apkopi') {
                            openBookingWithService();
                            setIsOpen(false);
                          } else if (qr === 'Skatīt velosipēdus' || qr === 'Velosipēdi pārdošanā' || qr === 'Skatīt elektrovelo') {
                            setActiveTab('bikes');
                            setIsOpen(false);
                          } else if (qr === 'Atvērt velosipēdu nomu' || qr === 'Velosipēdu noma') {
                            setActiveTab('rental');
                            setIsOpen(false);
                          } else {
                            handleSend(qr);
                          }
                        }}
                        className="text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-stone-500 text-xs italic">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce delay-300" />
                <span>Meistars Jānis raksta atbildi...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ieraksti jautājumu meistaram par remontu vai busiņu..."
                className="flex-1 text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-stone-900"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
