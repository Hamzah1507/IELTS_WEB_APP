import { Bot } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export interface ChatMessage {
  role: string;
  text: string;
}

interface AITutorViewProps {
  aiChatMessages: ChatMessage[];
  setAiChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  aiChatInput: string;
  setAiChatInput: Dispatch<SetStateAction<string>>;
}

export default function AITutorView({
  aiChatMessages,
  setAiChatMessages,
  aiChatInput,
  setAiChatInput
}: AITutorViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={24} /> AI Tutor Assistant
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Specialized in Immigration, IELTS, PTE, and TOEFL.</p>
      </div>
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f9fafb' }}>
          {aiChatMessages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'user' ? (
                <div style={{
                  maxWidth: '75%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '1rem 1rem 0 1rem',
                  backgroundColor: '#111827',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  {msg.text}
                </div>
              ) : (
                <div style={{
                  maxWidth: '75%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: '1rem 1rem 1rem 0',
                  backgroundColor: 'white',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }} dangerouslySetInnerHTML={{ __html: msg.text }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!aiChatInput.trim()) return;

            const userMsg = aiChatInput.trim();
            const lowerMsg = userMsg.toLowerCase();
            setAiChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
            setAiChatInput('');

            let botReply = 'I am an AI assistant specifically trained to assist you with English proficiency exams and immigration processes.\n\nWhile I am constantly learning new things, my primary focus is ensuring you get the highest possible band score on your tests and the most accurate pathways for your visa applications.\n\nPlease ask me a specific question regarding IELTS, PTE, TOEFL, or global immigration pathways, and I will be happy to provide a comprehensive guide.';
            if (lowerMsg.includes('weather')) {
              botReply = "I sincerely apologize, but I do not have access to real-time meteorological data or weather forecasting services.\n\nMy architecture is entirely dedicated to helping students and professionals navigate the complexities of international exams such as IELTS, PTE, and TOEFL, as well as providing detailed guidance on immigration and visa procedures.\n\nIf you have any questions regarding how to structure a Band 9 essay or what the Express Entry requirements are for Canada, I would be more than happy to assist you in great detail!";
            } else if (lowerMsg.includes('ielts') || lowerMsg.includes('preparation')) {
              botReply = "Preparing for the IELTS exam requires a strategic approach that balances both receptive skills (Listening and Reading) and productive skills (Speaking and Writing).\n\nFor the productive skills, I highly recommend checking out our 'Study Tools' section where you can find dedicated vocabulary lists, grammar rulebooks, and high-scoring templates. You can also paste your essays directly into this chat, and I will analyze them for lexical resource, grammatical range, and task achievement.\n\nFor receptive skills, consistency is key. Ensure you are taking at least two full 'Mock Tests' every week under timed conditions to build your stamina. Review every incorrect answer meticulously to understand the traps set by the examiners.\n\nOfficial Resource: <a href=\"https://www.ielts.org/\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">IELTS Official Website</a>";
            } else if (lowerMsg.includes('pte') || lowerMsg.includes('toefl')) {
              botReply = "Both PTE and TOEFL are entirely computer-based exams, which means that beyond just English proficiency, your typing speed, microphone etiquette, and familiarity with the testing software play a massive role in your final score.\n\nThe PTE Academic, in particular, relies heavily on integrated scoring. For instance, your performance in the 'Read Aloud' section heavily impacts your Reading score, not just your Speaking score. Therefore, mastering the specific algorithmic templates is crucial.\n\nSimilarly, the TOEFL iBT requires you to synthesize information across different mediums—reading a passage, listening to a lecture on the same topic, and then speaking or writing about how they relate. I can provide you with targeted exercises for these specific integrated tasks if you'd like to begin.\n\nOfficial Resources: <a href=\"https://www.pearsonpte.com/\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">PTE Official</a> | <a href=\"https://www.ets.org/toefl.html\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">TOEFL Official</a>";
            } else if (lowerMsg.includes('immigration') || lowerMsg.includes('visa') || lowerMsg.includes('pr') || lowerMsg.includes('canada') || lowerMsg.includes('australia')) {
              botReply = "Navigating international visa processes and permanent residency (PR) pathways can be an overwhelming journey due to the constantly changing policies and strict documentation requirements.\n\nFor Canada, the Express Entry system remains one of the most popular routes. It evaluates candidates based on the Comprehensive Ranking System (CRS), which heavily rewards younger applicants with high English proficiency (CLB 9 or higher), advanced degrees, and skilled work experience.\n\nFor Australia, the General Skilled Migration (GSM) program operates on a points-based system. Depending on your occupation, you might be eligible for a subclass 189 (Independent), 190 (State Nominated), or 491 (Regional) visa. Please let me know your specific target country, your current occupation, and your education level so I can give you a tailored pathway breakdown.\n\nOfficial Resources: <a href=\"https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">Canada Express Entry</a> | <a href=\"https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">Australia SkillSelect</a>";
            } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
              botReply = "Hello there! Welcome to your personal AI Tutor and Immigration Consultant.\n\nI am equipped with a vast database of strategies, templates, and past exam questions to help you conquer the IELTS, PTE, or TOEFL. Furthermore, I stay updated on the latest immigration pathways for countries like Canada, Australia, the UK, and New Zealand.\n\nTo get started, simply ask me to evaluate an essay, explain a complex grammar rule, or outline the requirements for a specific visa category. How can I best support your journey today?";
            }

            setTimeout(() => {
              setAiChatMessages(prev => [...prev, { role: 'bot', text: botReply }]);
            }, 800);
          }} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              placeholder="Ask about immigration pathways, IELTS writing tips..."
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.85rem', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '0 1.5rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
