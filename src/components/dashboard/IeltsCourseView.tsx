import { BookOpen } from 'lucide-react';

export default function IeltsCourseView() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={24} /> Premium IELTS Course
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Structured video lessons to master all four modules.</p>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
        <BookOpen size={48} color="#f59e0b" style={{ margin: '0 auto 1rem auto' }} />
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>Course Content Locked</p>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem', maxWidth: '400px', margin: '0.25rem auto 1.5rem auto' }}>You are currently on the standard plan. Upgrade to access premium video lectures and guided courses.</p>
        <button style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>Upgrade Plan</button>
      </div>
    </div>
  );
}
