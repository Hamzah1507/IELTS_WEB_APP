import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, PlayCircle } from 'lucide-react';

export default function IeltsDashboard() {
  return (
    <div className="animate-fade-in container">
      <Link href="/exams" className="flex items-center gap-2" style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Exams
      </Link>

      <div className="glass-panel" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>IELTS Preparation Hub</h1>
        <p style={{ opacity: 0.9, fontSize: '1.125rem', maxWidth: '600px' }}>
          Your complete toolkit for scoring Band 8+. Access mock tests, module-specific practice, and detailed analytics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Full Mock Tests</h2>
          <div className="flex flex-col gap-4">
            {/* Test 1 */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>IELTS Academic Test 1</h3>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-xl)', fontSize: '0.75rem', fontWeight: 600 }}>New</span>
                </div>
                <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <span className="flex items-center gap-1"><Clock size={14} /> 2h 45m</span>
                  <span>4 Modules</span>
                </div>
              </div>
              <Link href="/test/ielts-academic-1" className="btn-primary flex items-center gap-2">
                <PlayCircle size={18} /> Start Test
              </Link>
            </div>

            {/* Test 2 */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>IELTS Academic Test 2</h3>
                </div>
                <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <span className="flex items-center gap-1"><Clock size={14} /> 2h 45m</span>
                  <span>4 Modules</span>
                </div>
              </div>
              <Link href="/test/ielts-academic-2" className="btn-secondary flex items-center gap-2">
                Start Test
              </Link>
            </div>
            
            {/* Completed Test */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.8 }}>
              <div>
                <div className="flex items-center gap-3" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>IELTS Academic Test 3</h3>
                  <span className="flex items-center gap-1" style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600 }}><CheckCircle size={16} /> Completed</span>
                </div>
                <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <span>Band Score: 7.5</span>
                </div>
              </div>
              <Link href="/results/ielts-academic-3" className="btn-secondary flex items-center gap-2">
                View Results
              </Link>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Practice by Module</h3>
            <ul className="flex flex-col gap-3" style={{ listStyle: 'none' }}>
              <li>
                <button style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Reading <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>12 Tests</span>
                </button>
              </li>
              <li>
                <button style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Listening <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>8 Tests</span>
                </button>
              </li>
              <li>
                <button style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Writing <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>15 Tasks</span>
                </button>
              </li>
              <li>
                <button style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Speaking <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>5 Sessions</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
