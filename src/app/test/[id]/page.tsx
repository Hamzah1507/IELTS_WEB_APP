'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Clock, Flag, Save } from 'lucide-react';

export default function TestInterface() {
  const params = useParams();
  const testId = params.id as string;
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 40;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Test Header */}
      <div className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'sticky', top: '0', zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>IELTS Academic Reading - {testId}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Passage 1 of 3</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            <Clock size={24} color="var(--primary)" />
            59:45
          </div>
          <Link href={`/results/${testId}`} className="btn-primary flex items-center gap-2" style={{ padding: '0.5rem 1rem' }}>
            <Save size={16} /> Submit Test
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1, minHeight: 0 }}>
        {/* Left Side: Passage */}
        <div className="glass-panel" style={{ padding: '2rem', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            The Evolution of Architecture
          </h2>
          <div style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
            <p style={{ marginBottom: '1rem' }}>
              <strong>A.</strong> Architecture has evolved significantly over the centuries, reflecting both technological advancements and cultural shifts. In the ancient world, massive stone structures such as the Pyramids of Giza and the Parthenon demonstrated not only engineering prowess but also deep religious and political significance. These early monuments were built to last, emphasizing durability and monumental scale.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>B.</strong> During the Renaissance, there was a revival of classical ideals, focusing on symmetry, proportion, and geometry. Architects like Filippo Brunelleschi and Andrea Palladio drew inspiration from Roman antiquity, leading to the creation of harmonious and mathematically precise buildings. This period marked a departure from the soaring, vertical emphasis of Gothic architecture towards more grounded and balanced forms.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>C.</strong> The Industrial Revolution brought about profound changes in architectural practices. The mass production of iron and glass allowed for the construction of previously unimaginable structures. The Crystal Palace in London, designed by Joseph Paxton for the Great Exhibition of 1851, is a prime example of how new materials facilitated large-scale, luminous interiors.
            </p>
            <p>
              <em>(Data will be dynamically populated here based on your dataset)</em>
            </p>
          </div>
        </div>

        {/* Right Side: Questions */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Questions 1 - 5</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.</p>
          </div>
          
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
            {/* Question 1 */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--primary)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                    Ancient architecture, such as the Pyramids, primarily served to showcase <input type="text" placeholder="Your answer" style={{ border: 'none', borderBottom: '2px solid var(--border)', background: 'transparent', outline: 'none', padding: '0.25rem 0.5rem', fontSize: '1rem', width: '150px' }} /> as well as cultural importance.
                  </p>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <Flag size={14} /> Flag for review
                  </button>
                </div>
              </div>
            </div>

            {/* Question 2 */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--border)', color: 'var(--text-main)', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                  2
                </div>
                <div style={{ width: '100%' }}>
                  <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                    According to paragraph B, Renaissance architects focused heavily on:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="radio" name="q2" />
                      A) Vertical emphasis and height
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '2px solid var(--primary)', background: 'rgba(79, 70, 229, 0.05)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="radio" name="q2" defaultChecked />
                      B) Symmetry, proportion, and geometry
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <input type="radio" name="q2" />
                      C) Mass production of materials
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={16} /> Previous
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <button key={num} style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', border: num === 1 ? 'none' : '1px solid var(--border)', background: num === 1 ? 'var(--primary)' : 'var(--surface)', color: num === 1 ? 'white' : 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
                  {num}
                </button>
              ))}
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', color: 'var(--text-muted)' }}>...</span>
            </div>
            <button className="btn-primary flex items-center gap-2">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
