import { FileCheck } from 'lucide-react';

export default function IeltsTemplatesView() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={24} /> IELTS Templates
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>High-scoring templates for Writing Task 1 and Task 2.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {[
          { title: 'Task 1: Line Graph', desc: 'Standard structure for describing trends and comparisons.' },
          { title: 'Task 1: Bar Chart', desc: 'Vocabulary and phrasing for bar chart data.' },
          { title: 'Task 2: Opinion Essay', desc: 'Introduction, body paragraphs, and conclusion structure.' },
          { title: 'Task 2: Discuss Both Views', desc: 'How to balance both sides of an argument effectively.' }
        ].map((template, idx) => (
          <div key={idx} style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <FileCheck size={20} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>{template.title}</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{template.desc}</p>
            <button onClick={() => alert(`Opening ${template.title}...\\n\\nThis template will be available in the next content update.`)} style={{ marginTop: '1rem', width: '100%', backgroundColor: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>View Template</button>
          </div>
        ))}
      </div>
    </div>
  );
}
