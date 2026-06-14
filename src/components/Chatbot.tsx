import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Scale, Loader2 } from 'lucide-react';

const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY || '';
const SARVAM_URL = 'https://api.sarvam.ai/v1/chat/completions';

const SYSTEM_PROMPT = `<role>
You are "Nepal Kanoon Sahayak" — a Nepal Law and Order Assistant. Your sole purpose is to educate Nepali citizens about what is illegal under Nepali law, what punishments they may face, and how to avoid breaking the law. You are NOT a lawyer. You do NOT give personal legal advice. For specific legal cases, always direct the user to consult a qualified Nepali lawyer (advocate).
</role>

<knowledge_scope>
You answer questions based on Nepal's legal framework, including:
- Muluki Ain (General Code) 2074
- Muluki Criminal Procedure Code 2074
- Narcotic Drugs (Control) Act 2033
- Electronic Transactions Act 2063 (Cybercrime)
- Domestic Violence (Offence and Punishment) Act 2066
- Human Trafficking and Transportation (Control) Act 2064
- Corruption Prevention Act 2059
- Motor Vehicle and Transportation Management Act 2049
- Consumer Protection Act 2075
- Labor Act 2074
- Land Revenue Act and related property laws
- Environment Protection Act 2076
- Child-related laws under the Children's Act 2075
</knowledge_scope>

<instructions>
When a user asks about a law, illegal act, or punishment in Nepal:
1. IDENTIFY: Clearly state what specific act or behavior is illegal.
2. EXPLAIN: Describe the law in simple, plain language a common citizen can understand.
3. CITE: Name the specific Act or Section of Nepali law that applies.
4. PUNISH: State the exact punishment — years of imprisonment, fines in NPR, or both.
5. PRECAUTION: End with one short, practical tip on how the citizen can avoid this legal issue.
6. DISCLAIM: Always end with the standard disclaimer.
</instructions>

<language_rule>
- If the user writes in Nepali (Devanagari script), respond entirely in Nepali.
- If the user writes in English, respond entirely in English.
- If the user mixes both languages, prefer Nepali for the response.
- Keep language simple, as if explaining to a person with no legal background.
</language_rule>

<constraints>
- Do NOT make up laws or punishments. If unsure, say so honestly.
- Do NOT help users find loopholes or commit illegal acts.
- Do NOT provide legal strategy for criminal defense — only general law education.
- Keep responses under 250 words unless the user asks for more detail.
- Tone: Formal but approachable — like a knowledgeable community helper.
</constraints>

<output_format>
Structure every response exactly like this:

**के गैरकानुनी छ / What is Illegal:**
[One sentence description]

**कानुन / Law:**
[Name of the Act + Section number]

**सजाय / Punishment:**
[Exact jail time and/or fine in NPR]

**सावधानी / Precaution:**
[One practical tip]

**सूचना / Disclaimer:**
[Standard disclaimer line]
</output_format>

<fallback>
If the user asks something unrelated to Nepal law and order, respond with:
"I can only help with questions about Nepal's laws and legal system. Please ask a law-related question."
</fallback>`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ── Offline law knowledge base for when API is unreachable ──
const LAW_DB: { keywords: string[]; answer: string }[] = [
  { keywords: ['cybercrime','cyber','hack','online','internet','electronic'],
    answer: `**What is Illegal:**\nUnauthorized access to computer systems, hacking, phishing, online fraud, and publishing obscene content online.\n\n**Law:**\nElectronic Transactions Act 2063 (Sections 45-50)\n\n**Punishment:**\nUp to 5 years imprisonment and/or fine up to NPR 100,000 for computer fraud. Publishing obscene material: up to 5 years and/or NPR 100,000.\n\n**Precaution:**\nNever access systems without authorization. Use strong passwords and avoid sharing personal data online.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['domestic','violence','wife','husband','घरेलु','हिंसा'],
    answer: `**के गैरकानुनी छ:**\nकुनै पनि प्रकारको घरेलु हिंसा — शारीरिक, मानसिक, यौन वा आर्थिक।\n\n**कानुन:**\nघरेलु हिंसा (कसुर र सजाय) ऐन, २०६६\n\n**सजाय:**\n६ महिनासम्म कैद र/वा NPR 25,000 सम्म जरिवाना।\n\n**सावधानी:**\nघरेलु हिंसा भएमा तुरुन्तै नजिकको प्रहरी चौकीमा उजुरी दिनुहोस्।\n\n**सूचना:**\nयो जानकारी शैक्षिक उद्देश्यका लागि मात्र हो। कानुनी समस्याका लागि कृपया योग्य वकिल (advocate) सँग परामर्श गर्नुहोस्।` },
  { keywords: ['drug','narcotic','drugs','marijuana','cannabis','गाँजा','लागुऔषध'],
    answer: `**What is Illegal:**\nProduction, sale, distribution, possession, and consumption of narcotic drugs including marijuana, hashish, heroin, and cocaine.\n\n**Law:**\nNarcotic Drugs (Control) Act 2033 (Sections 4-7)\n\n**Punishment:**\nPossession: Up to 1 year imprisonment. Trafficking: Up to 10 years imprisonment. Large-scale trafficking: Up to life imprisonment and heavy fines.\n\n**Precaution:**\nStay away from all narcotic substances. Even possession of small amounts is a criminal offense.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['drunk','driving','alcohol','drink','vehicle','accident','सवारी'],
    answer: `**What is Illegal:**\nDriving any motor vehicle while under the influence of alcohol or intoxicating substances.\n\n**Law:**\nMotor Vehicle and Transportation Management Act 2049 (Section 157)\n\n**Punishment:**\nFine of NPR 1,000-3,000 and/or up to 3 months imprisonment. License may be suspended for up to 1 year.\n\n**Precaution:**\nNever drive after consuming alcohol. Use a taxi or designated driver.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['corruption','bribe','रिश्वत','भ्रष्टाचार','घूस'],
    answer: `**What is Illegal:**\nGiving or accepting bribes, misuse of authority, and embezzlement of public funds by public officials.\n\n**Law:**\nCorruption Prevention Act 2059 (Sections 3-4)\n\n**Punishment:**\nUp to 3 years imprisonment or fine up to the bribe amount or both. For public officials: up to 10 years.\n\n**Precaution:**\nReport corruption to CIAA (Commission for Investigation of Abuse of Authority). Never offer or accept bribes.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['theft','steal','चोरी','robbery','loot','डकैती'],
    answer: `**What is Illegal:**\nTaking someone else's property without consent, including theft, robbery, and burglary.\n\n**Law:**\nMuluki Criminal Code 2074 (Sections 293-299)\n\n**Punishment:**\nSimple theft: Up to 3 years imprisonment and/or fine up to double the stolen value. Armed robbery: Up to 10 years. Dacoity: Up to 15 years.\n\n**Precaution:**\nRespect others' property. Report any theft to the nearest police station immediately.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['murder','kill','हत्या','death','मृत्यु'],
    answer: `**What is Illegal:**\nIntentionally causing the death of another person (murder/homicide).\n\n**Law:**\nMuluki Criminal Code 2074 (Section 184)\n\n**Punishment:**\nLife imprisonment (जन्मकैद). Attempt to murder: Up to 10 years imprisonment.\n\n**Precaution:**\nResolve conflicts peacefully. Seek mediation or legal channels for disputes.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['child','बालबालिका','minor','underage','बाल'],
    answer: `**What is Illegal:**\nChild labor, child marriage, child abuse, and exploitation of children under 18.\n\n**Law:**\nChildren's Act 2075 (Sections 52-66)\n\n**Punishment:**\nChild labor: Up to 3 years imprisonment and/or NPR 75,000 fine. Child marriage: Up to 3 years imprisonment.\n\n**Precaution:**\nReport any child abuse to the nearest police station or call child helpline 1098.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['land','property','जग्गा','सम्पत्ति','ownership'],
    answer: `**What is Illegal:**\nFraudulent land transactions, forging land documents, illegal encroachment of government/public land.\n\n**Law:**\nLand Revenue Act 2034 and Muluki Criminal Code 2074 (Sections on Forgery)\n\n**Punishment:**\nLand fraud: Up to 5 years imprisonment. Forgery of documents: Up to 3 years imprisonment.\n\n**Precaution:**\nAlways verify land ownership at the Land Revenue Office before any transaction.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
  { keywords: ['trafficking','human','मानव','बेचबिखन'],
    answer: `**What is Illegal:**\nBuying, selling, or transporting any person for exploitation, forced labor, or sexual exploitation.\n\n**Law:**\nHuman Trafficking and Transportation (Control) Act 2064 (Sections 3-4)\n\n**Punishment:**\nUp to 20 years imprisonment and fine up to NPR 200,000.\n\n**Precaution:**\nBe aware of fraudulent job offers. Report suspicious activities to police or National Human Rights Commission.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).` },
];

function getOfflineResponse(query: string): string {
  const q = query.toLowerCase();
  for (const entry of LAW_DB) {
    if (entry.keywords.some(kw => q.includes(kw))) return entry.answer;
  }
  return `I can help you with questions about Nepal's laws. Here are some topics I can answer:\n\n• Cybercrime & Electronic Transactions\n• Domestic Violence\n• Drug Laws\n• Drunk Driving\n• Corruption & Bribery\n• Theft & Robbery\n• Murder & Homicide\n• Child Protection Laws\n• Land & Property Laws\n• Human Trafficking\n\nPlease ask a specific question about any of these topics.\n\n**Disclaimer:**\nThis information is for educational purposes only. For legal matters, please consult a qualified Nepali lawyer (advocate).`;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (!SARVAM_API_KEY) {
        const offlineReply = getOfflineResponse(userMsg.content);
        setMessages(prev => [...prev, { role: 'assistant', content: offlineReply }]);
        return;
      }

      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMsg.content },
      ];

      // Try sarvam-m first, then fall back to other models
      const models = ['sarvam-m', 'sarvam-30b', 'sarvam-105b'];
      let reply = '';
      let success = false;

      for (const model of models) {
        try {
          const res = await fetch(SARVAM_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SARVAM_API_KEY}`,
              'api-subscription-key': SARVAM_API_KEY,
            },
            body: JSON.stringify({
              model,
              messages: apiMessages,
              max_tokens: 1024,
              temperature: 0.3,
              reasoning_effort: null,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            reply = data.choices?.[0]?.message?.content || '';
            if (reply) { success = true; break; }
          }
        } catch { /* try next model */ }
      }

      if (!success || !reply) {
        // If Sarvam API fails (CORS / network), use a helpful offline response
        reply = getOfflineResponse(userMsg.content);
      }
      
      // Strip <think>...</think> tags if present
      const cleaned = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      setMessages(prev => [...prev, { role: 'assistant', content: cleaned }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const fallback = getOfflineResponse(userMsg.content);
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Floating button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[1000] w-14 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 group"
        title="Nepal Law Assistant"
      >
        <Scale className="w-6 h-6 group-hover:hidden" />
        <MessageCircle className="w-6 h-6 hidden group-hover:block" />
        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white text-[8px] font-bold flex items-center justify-center">AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[1000] w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">Nepal Kanoon Sahayak</h3>
            <p className="text-slate-400 text-[11px] leading-tight">Nepal Law & Order Assistant</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg flex items-center justify-center transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Nepal Law Assistant</h4>
            <p className="text-sm text-slate-500 mb-4">Ask me about Nepal's laws, penalties, and your legal rights.</p>
            <div className="space-y-2">
              {['What is the punishment for cybercrime?', 'नेपालमा घरेलु हिंसाको सजाय के हो?', 'Is drunk driving illegal in Nepal?'].map(q => (
                <button key={q} onClick={() => { setInput(q); }} className="w-full text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 transition">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-slate-900 text-white rounded-br-md'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm'
            }`}>
              {m.role === 'assistant' ? (
                <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                  __html: m.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
                    .replace(/\n/g, '<br/>')
                }} />
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              <span className="text-sm text-slate-500">Analyzing Nepal law...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Nepal law..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400 focus:bg-white transition"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">Powered by Sarvam AI • Educational purposes only</p>
      </div>
    </div>
  );
}
