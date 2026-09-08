import Link from 'next/link';
import { ArrowRight, BookOpen, Layers, Star } from 'lucide-react';

export default function ExamsCatalog() {
  return (
    <div className="animate-fade-in container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Available Exams</h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse our catalog of premium test preparation materials.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* IELTS Card */}
        <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '2rem', color: 'white', position: 'relative' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>IELTS</h2>
            <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Academic & General Training</p>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%' }}>
              <Star size={20} fill="white" />
            </div>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Layers size={16} /> 4 Modules (Reading, Writing, Listening, Speaking)
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <BookOpen size={16} /> 20+ Full Mock Tests
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
              Comprehensive preparation material for the International English Language Testing System. Get your desired band score!
            </p>
            <Link href="/exams/ielts" className="btn-primary flex items-center justify-center gap-2" style={{ marginTop: 'auto' }}>
              View Course <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* TOEFL Card */}
        <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', padding: '2rem', color: 'white', position: 'relative' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>TOEFL iBT</h2>
            <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Test of English as a Foreign Language</p>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Layers size={16} /> 4 Sections
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <BookOpen size={16} /> 15 Practice Tests
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
              Master the TOEFL test format and improve your academic English skills.
            </p>
            <button className="btn-secondary flex items-center justify-center gap-2" style={{ marginTop: 'auto', opacity: 0.7, cursor: 'not-allowed' }}>
              Coming Soon
            </button>
          </div>
        </div>

        {/* GRE Card */}
        <div className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', padding: '2rem', color: 'white', position: 'relative' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>GRE</h2>
            <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>Graduate Record Examinations</p>
          </div>
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <Layers size={16} /> Verbal, Quantitative, Analytical
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <BookOpen size={16} /> 10 Full Tests
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', flex: 1 }}>
              Intensive practice for the GRE general test to secure your admission.
            </p>
            <button className="btn-secondary flex items-center justify-center gap-2" style={{ marginTop: 'auto', opacity: 0.7, cursor: 'not-allowed' }}>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
