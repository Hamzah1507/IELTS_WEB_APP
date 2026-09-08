import Link from 'next/link';
import { ArrowLeft, Award, BarChart2, CheckCircle, Target, XCircle } from 'lucide-react';

export default function ResultsPage() {
  return (
    <div className="animate-fade-in container">
      <Link href="/exams/ielts" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', marginBottom: '1rem' }}>
          <Award size={40} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Test Completed Successfully!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>IELTS Academic Reading Test 1</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Score Summary */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem' }}>Your Estimated Band Score</h2>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '8px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}>7.5</span>
          </div>
          <div style={{ width: '100%' }}>
            <div className="flex justify-between" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Raw Score</span>
              <span style={{ fontWeight: 600 }}>32 / 40</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--primary)' }}></div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <BarChart2 size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Performance Breakdown</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Passage 1 */}
            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 600 }}>Passage 1</h3>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>12 / 13 Correct</span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: 13 }).map((_, i) => (
                  <div key={i} style={{ height: '8px', flex: 1, borderRadius: '2px', background: i === 4 ? 'var(--accent)' : 'var(--secondary)' }}></div>
                ))}
              </div>
            </div>

            {/* Passage 2 */}
            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 600 }}>Passage 2</h3>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>10 / 13 Correct</span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: 13 }).map((_, i) => (
                  <div key={i} style={{ height: '8px', flex: 1, borderRadius: '2px', background: i === 2 || i === 7 || i === 11 ? 'var(--accent)' : 'var(--secondary)' }}></div>
                ))}
              </div>
            </div>

            {/* Passage 3 */}
            <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 600 }}>Passage 3</h3>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>10 / 14 Correct</span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} style={{ height: '8px', flex: 1, borderRadius: '2px', background: i === 1 || i === 5 || i === 9 || i === 12 ? 'var(--accent)' : 'var(--secondary)' }}></div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="btn-primary flex items-center justify-center gap-2" style={{ flex: 1 }}>
              Review Answers
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2" style={{ flex: 1 }}>
              Retake Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
