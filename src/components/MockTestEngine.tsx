'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Flag, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SectionState = 'listening' | 'reading' | 'writing' | 'speaking';

export default function MockTestEngine({ testId, onFinish }: { testId: string, onFinish?: () => void }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [testData, setTestData] = useState<any>(null);

  const [currentSection, setCurrentSection] = useState<SectionState>('listening');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(90 * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Save failed'>('Saved');
  const [testPhase, setTestPhase] = useState<'intro' | 'section_intro' | 'test' | 'completed'>('intro');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(Date.now());
  const pendingSave = useRef<boolean>(false);

  // Initialize test
  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }
        setStudentId(user.id);

        // Start/Resume Attempt
        const resStart = await fetch('/api/mock-test/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId, studentId: user.id })
        });

        if (!resStart.ok) {
          const errData = await resStart.json();
          throw new Error(errData.error || "Failed to start/resume test");
        }

        const dataStart = await resStart.json();

        setAttemptId(dataStart.attempt.id);
        setCurrentSection(dataStart.attempt.current_section as SectionState);
        setRemainingSeconds(dataStart.attempt.remaining_seconds);
        if (dataStart.attempt.answers) setAnswers(dataStart.attempt.answers);

        // Fetch Questions
        const resQ = await fetch(`/api/mock-test/questions?testId=${testId}`);
        if (!resQ.ok) {
          let errMessage = "Failed to load questions";
          try {
            const errData = await resQ.json();
            if (errData.error) errMessage += `: ${errData.error}`;
            if (errData.details) errMessage += ` (${errData.details})`;
          } catch (e) {}
          throw new Error(errMessage);
        }
        const dataQ = await resQ.json();
        setTestData(dataQ);

        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        setLoading(false);
      }
    }
    init();
  }, [testId, router]);

  // Timer & Autosave Loop
  useEffect(() => {
    if (loading || !attemptId || remainingSeconds <= 0 || testPhase !== 'test') return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return next;
      });

      // Autosave every 30 seconds
      if (Date.now() - lastSaveTime.current > 30000 || pendingSave.current) {
        autosave();
      }
    }, 1000);

    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, attemptId, currentSection, currentQuestionIdx, testPhase]);

  async function autosave() {
    if (!attemptId || !studentId) return;
    setSaveStatus('Saving...');
    pendingSave.current = false;
    lastSaveTime.current = Date.now();
    try {
      await fetch('/api/mock-test/autosave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          studentId,
          currentSection,
          currentQuestion: currentQuestionIdx.toString(),
          remainingSeconds,
          answers
        })
      });
      setSaveStatus('Saved');
    } catch {
      setSaveStatus('Save failed');
      pendingSave.current = true;
    }
  }

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    pendingSave.current = true;
  };

  const handleNextSection = async () => {
    const sections: SectionState[] = ['listening', 'reading', 'writing', 'speaking'];
    const idx = sections.indexOf(currentSection);
    if (idx < sections.length - 1) {
      setCurrentSection(sections[idx + 1]);
      setCurrentQuestionIdx(0);
      setTestPhase('section_intro');
      await autosave();
    } else {
      await handleAutoSubmit();
    }
  };

  async function handleAutoSubmit() {
    if (!attemptId || !studentId || isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current!);
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/mock-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, studentId, testId, finalAnswers: answers })
      });

      const data = await res.json();
      if (!res.ok && data.error !== "Test already submitted") {
        throw new Error(data.error);
      }

      if (onFinish) {
        onFinish();
      } else {
        setTestPhase('completed');
      }
    } catch {
      setSaveStatus('Save failed');
      setIsSubmitting(false);
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '500px', flexDirection: 'column', gap: '1rem', backgroundColor: '#fafafa', borderRadius: '0.25rem' }}>
        <Loader2 size={32} className="animate-spin" color="#000000" />
        <p style={{ color: '#6b7280' }}>Loading Mock Test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '500px', flexDirection: 'column', gap: '1rem', color: '#ef4444', backgroundColor: '#fef2f2', borderRadius: '0.25rem', border: '1px solid #fecaca' }}>
        <AlertTriangle size={48} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Database Error</h2>
        <p style={{ maxWidth: '400px', textAlign: 'center', color: '#991b1b' }}>{error}</p>
      </div>
    );
  }

  // Derived state for current view
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentQuestionsList: any[] = [];
  let sectionTitle = "";

  if (currentSection === 'listening') {
    currentQuestionsList = testData?.listening || [];
    sectionTitle = "Listening Section";
  } else if (currentSection === 'reading') {
    currentQuestionsList = testData?.reading || [];
    sectionTitle = "Reading Section";
  } else if (currentSection === 'writing') {
    currentQuestionsList = testData?.writing || [];
    sectionTitle = "Writing Section";
  } else if (currentSection === 'speaking') {
    // Flatten speaking parts for simple navigation if needed
    const speakingData = testData?.speaking;
    const part2Arr = speakingData?.part2 ? (Array.isArray(speakingData.part2) ? speakingData.part2 : [speakingData.part2]) : [];
    currentQuestionsList = speakingData ? [...(speakingData.part1 || []), ...part2Arr, ...(speakingData.part3 || [])] : [];
    sectionTitle = "Speaking Section";
  }

  // Pagination logic: IELTS dynamic grouping
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pageGroups: any[][] = [];
  if (currentSection === 'listening' || currentSection === 'reading' || currentSection === 'speaking') {
    for (let i = 0; i < currentQuestionsList.length; i += 5) {
      pageGroups.push(currentQuestionsList.slice(i, i + 5));
    }
  } else {
    pageGroups = currentQuestionsList.map(q => [q]);
  }

  const totalPages = Math.max(1, pageGroups.length);

  let currentQPage = 0;
  let accumulated = 0;
  for (let i = 0; i < pageGroups.length; i++) {
    accumulated += pageGroups[i].length;
    if (currentQuestionIdx < accumulated) {
      currentQPage = i;
      break;
    }
  }

  const visibleQuestions = pageGroups[currentQPage] || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, backgroundColor: '#fafafa', color: '#111827', borderRadius: '0.25rem', overflow: 'hidden', boxSizing: 'border-box' }}>
      {/* Test Header */}
      <div style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', zIndex: 10, flexShrink: 0, boxSizing: 'border-box' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#000000' }}>IELTS Academic Mock Test</h1>
          <p style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {testPhase === 'test' ? `${sectionTitle} • ${saveStatus}` : 'Instructions'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#000000' }}>
            <Clock size={24} color="#000000" />
            {formatTime(remainingSeconds)}
          </div>
          <button onClick={handleAutoSubmit} disabled={isSubmitting} style={{ padding: '0.6rem 1.25rem', backgroundColor: isSubmitting ? '#9ca3af' : '#000000', color: 'white', borderRadius: '0.25rem', fontWeight: 600, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      {testPhase === 'intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0.5rem 1rem', textAlign: 'center', overflowY: 'hidden', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.15rem', marginTop: 'auto', color: '#000000' }}>IELTS Academic Mock Test</h2>
          <p style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '0.75rem', fontWeight: 500 }}>Test 001 • Total time: 90 minutes</p>

          <div style={{ backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', textAlign: 'left', maxWidth: '650px', width: '100%', marginBottom: '0.75rem', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#000000', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.4rem' }}>Sections</h3>
            <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 0.75rem 0', color: '#111827', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }}></span><strong>Listening:</strong> 20 minutes</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }}></span><strong>Reading:</strong> 30 minutes</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }}></span><strong>Writing:</strong> 25 minutes</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#000000' }}></span><strong>Speaking:</strong> 15 minutes</li>
            </ul>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: '#000000', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.4rem' }}>Instructions</h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#374151', display: 'grid', gap: '0.35rem', margin: 0, fontSize: '0.95rem', lineHeight: '1.3' }}>
              <li>Read instructions carefully.</li>
              <li>Answer every question.</li>
              <li>Listening answers should be entered while listening.</li>
              <li>Reading answers must be based on the passage.</li>
              <li>Writing responses must satisfy the task requirements.</li>
              <li>Speaking responses should address the questions fully.</li>
              <li>The timer continues according to the test rules.</li>
              <li>Progress is automatically saved.</li>
            </ul>
          </div>

          <button
            onClick={() => setTestPhase('section_intro')}
            style={{ padding: '0.75rem 4rem', backgroundColor: '#000000', color: 'white', borderRadius: '0.25rem', fontSize: '1.15rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: 'none', transition: 'all 0.2s ease-in-out', marginBottom: 'auto' }}
          >
            Begin Test
          </button>
        </div>
      )}

      {testPhase === 'section_intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#000000' }}>{sectionTitle}</h2>

          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.25rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', maxWidth: '550px', width: '100%', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '1.25rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
              {currentSection === 'listening' && "20 minutes. Please listen to the audio carefully and answer all questions."}
              {currentSection === 'reading' && "30 minutes. Read the passage and answer the questions based on the text."}
              {currentSection === 'writing' && "25 minutes. Complete Task 1 and Task 2 according to the instructions."}
              {currentSection === 'speaking' && "15 minutes. Follow the prompts for Part 1, Part 2, and Part 3."}
            </p>
          </div>

          <button
            onClick={() => setTestPhase('test')}
            style={{ padding: '1rem 4rem', backgroundColor: '#000000', color: 'white', borderRadius: '0.25rem', fontSize: '1.25rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: 'none', transition: 'all 0.2s ease-in-out' }}
          >
            Start Section
          </button>
        </div>
      )}

      {testPhase === 'test' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1, minHeight: 0, padding: '1.5rem' }}>
          {/* Left Side: Passage / Context */}
          <div style={{ backgroundColor: 'white', padding: '2rem', overflowY: 'auto', borderRadius: '0.25rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minHeight: 0 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', textTransform: 'capitalize', color: '#000000' }}>
              {currentSection} Context
            </h2>
            <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#111827' }}>
              <div style={{ marginBottom: '1rem' }}>
                {currentSection === 'reading' && visibleQuestions[0] && (
                  <>
                    {visibleQuestions[0].passage_text || visibleQuestions[0].passage || visibleQuestions[0].context || (
                      <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.25rem', fontWeight: 600 }}>
                        READING PASSAGE CONTENT MISSING<br />
                        <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>The full passage text must be provided in the reading.json dataset.</span>
                      </div>
                    )}
                  </>
                )}
                {currentSection === 'listening' && visibleQuestions[0] && (
                  <>
                    {(visibleQuestions[0].audio_url || visibleQuestions[0].audio_asset || visibleQuestions[0].audio) ? (
                      <audio controls src={visibleQuestions[0].audio_url || (visibleQuestions[0].audio_asset ? `/api/mock-test/audio?testId=${testId}&asset=${visibleQuestions[0].audio_asset}` : visibleQuestions[0].audio)} style={{ width: '100%', marginBottom: '1rem' }} />
                    ) : (
                      <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.25rem', fontWeight: 600, marginBottom: '1rem' }}>
                        LISTENING AUDIO ASSET MISSING<br />
                        <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>An audio file (.mp3/.wav) or external URL must be provided in the listening.json dataset.</span>
                      </div>
                    )}
                  </>
                )}
                {currentSection === 'writing' && visibleQuestions[0] && (
                  <>
                    <strong>{visibleQuestions[0].task_type || 'Task'}</strong><br />
                    {visibleQuestions[0].question}<br /><br />
                    <em>{visibleQuestions[0].instructions}</em>
                    {visibleQuestions[0].visual_type === 'bar' && visibleQuestions[0].visual_data && (
                      <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem', backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', height: '250px', alignItems: 'flex-end', gap: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #d1d5db', overflowX: 'auto' }}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {visibleQuestions[0].visual_data.labels.map((label: string, i: number) => (
                            <div key={label} style={{ display: 'flex', flex: 1, height: '100%', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', position: 'relative', minWidth: '100px' }}>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {visibleQuestions[0].visual_data.datasets.map((ds: any, j: number) => (
                                <div key={j} style={{ width: '100%', maxWidth: '30px', height: `${ds.data[i]}%`, backgroundColor: ds.color || ['#3b82f6', '#ef4444', '#000000', '#000000'][j % 4], borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                  <span style={{ position: 'absolute', top: '-1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{ds.data[i]}%</span>
                                </div>
                              ))}
                              <div style={{ position: 'absolute', bottom: '-2rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{label}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {visibleQuestions[0].visual_data.datasets.map((ds: any, j: number) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                              <div style={{ width: '12px', height: '12px', backgroundColor: ds.color || ['#3b82f6', '#ef4444', '#000000', '#000000'][j % 4], borderRadius: '2px' }}></div>
                              {ds.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {currentSection === 'speaking' && visibleQuestions[0] && (
                  <>
                    <strong>Speaking Prompt</strong><br />
                    {visibleQuestions[0].question || visibleQuestions[0].topic}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#000000', margin: 0 }}>Question(s) {currentQuestionIdx + 1}{visibleQuestions.length > 1 ? ` - ${currentQuestionIdx + visibleQuestions.length}` : ''} of {currentQuestionsList.length}</h3>
                <p style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: '0.25rem' }}>Answer the questions below based on the context.</p>
              </div>
              {currentSection !== 'speaking' && (
                <button onClick={handleNextSection} style={{ fontSize: '0.85rem', color: '#000000', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Skip to Next Section &rarr;
                </button>
              )}
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {visibleQuestions.map((q, idx) => {
                const displayNum = currentQuestionIdx + idx + 1;
                const qId = q.question_id || q.task_id || `q-${displayNum}`;

                return (
                  <div key={qId} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ backgroundColor: '#e5e7eb', color: '#000000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                        {displayNum}
                      </div>
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: '1.05rem', marginBottom: '1rem', color: '#000000' }}>
                          {q.question}
                        </div>

                        {/* Input types based on section/type */}
                        {(currentSection === 'listening' || currentSection === 'reading') && (!q.options || q.options.length === 0) ? (
                          <input
                            type="text"
                            placeholder="Your answer"
                            value={answers[qId] || ''}
                            onChange={(e) => handleAnswerChange(qId, e.target.value)}
                            style={{ border: '1px solid #d1d5db', borderRadius: '0.25rem', background: 'transparent', outline: 'none', padding: '0.25rem 0.5rem', fontSize: '1rem', width: '100%', maxWidth: '300px', color: '#000000' }}
                          />
                        ) : (currentSection === 'listening' || currentSection === 'reading') && q.options ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {q.options.map((opt: any, oIdx: number) => (
                              <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: answers[qId] === opt ? '2px solid #000000' : '1px solid #e5e7eb', background: answers[qId] === opt ? '#f3f4f6' : 'transparent', borderRadius: '0.25rem', cursor: 'pointer', transition: 'all 0.2s', color: '#111827' }}>
                                <input
                                  style={{ accentColor: '#000000' }}
                                  type="radio"
                                  name={qId}
                                  checked={answers[qId] === opt}
                                  onChange={() => handleAnswerChange(qId, opt)}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : currentSection === 'writing' ? (
                          <textarea
                            rows={10}
                            placeholder="Type your essay here..."
                            value={answers[qId] || ''}
                            onChange={(e) => handleAnswerChange(qId, e.target.value)}
                            style={{ width: '100%', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem', resize: 'vertical', backgroundColor: '#ffffff', color: '#000000', outline: 'none', fontFamily: 'inherit' }}
                          />
                        ) : currentSection === 'speaking' ? (
                          <div style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem', backgroundColor: '#ffffff', textAlign: 'center' }}>
                            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>Audio recording feature is pending integration.</p>
                            <textarea
                              rows={3}
                              placeholder="Type notes/response here for now..."
                              value={answers[qId] || ''}
                              onChange={(e) => handleAnswerChange(qId, e.target.value)}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', resize: 'vertical', background: 'white', outline: 'none', fontSize: '0.85rem' }}
                            />
                          </div>
                        ) : null}

                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', marginTop: '1rem' }}>
                          <Flag size={14} /> Flag for review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', backgroundColor: 'white', color: '#374151', cursor: currentQPage === 0 ? 'not-allowed' : 'pointer', opacity: currentQPage === 0 ? 0.5 : 1, fontWeight: 600, fontSize: '0.85rem' }}
                onClick={() => {
                  if (currentQPage > 0) {
                    let prevIdx = 0;
                    for (let i = 0; i < currentQPage - 1; i++) prevIdx += pageGroups[i].length;
                    setCurrentQuestionIdx(prevIdx);
                  }
                }}
                disabled={currentQPage === 0}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, num) => {
                  const pageNum = num;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        let targetIdx = 0;
                        for (let i = 0; i < pageNum; i++) targetIdx += pageGroups[i].length;
                        setCurrentQuestionIdx(targetIdx);
                      }}
                      style={{ width: '36px', height: '36px', borderRadius: '0.25rem', border: pageNum === currentQPage ? 'none' : '1px solid #d1d5db', background: pageNum === currentQPage ? '#000000' : 'white', color: pageNum === currentQPage ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600 }}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                {totalPages > 5 && <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', color: '#9ca3af' }}>...</span>}
              </div>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', backgroundColor: '#000000', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                onClick={() => {
                  if (currentQPage < totalPages - 1) {
                    let nextIdx = 0;
                    for (let i = 0; i <= currentQPage; i++) nextIdx += pageGroups[i].length;
                    setCurrentQuestionIdx(nextIdx);
                  } else {
                    handleNextSection();
                  }
                }}
              >
                {currentQPage < totalPages - 1 ? (
                  <>Next <ChevronRight size={16} /></>
                ) : (
                  <>Next Section <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {testPhase === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh', backgroundColor: 'white', borderRadius: '0.25rem', border: '1px solid #e5e7eb', padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f3f4f6', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#000000', marginBottom: '1rem' }}>Test Completed Successfully!</h2>
          <p style={{ color: '#4b5563', fontSize: '1rem', maxWidth: '500px', marginBottom: '2rem', lineHeight: 1.5 }}>
            Your answers for the IELTS Mock Test have been successfully submitted and saved. Your instructor will review your speaking and writing sections and provide a comprehensive band score.
          </p>
          <button
            onClick={() => {
              if (onFinish) {
                onFinish();
              } else {
                router.push('/dashboard');
              }
            }}
            style={{ padding: '0.75rem 2rem', borderRadius: '0.25rem', backgroundColor: '#000000', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#000000'}
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
