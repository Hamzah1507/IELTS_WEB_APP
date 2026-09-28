'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Settings, HelpCircle, Award } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/login' || pathname === '/dashboard') return null;

  return (
    <aside className="sidebar">
      <div className="p-6">
        <h1 className="flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
          <Award size={28} />
          Vectra Foreign Services
        </h1>
      </div>
      <nav style={{ flex: 1, padding: '0 1rem' }}>
        <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
          <li>
            <Link href="/" className="flex items-center gap-4" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)'; e.currentTarget.style.color = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              <Home size={20} /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/exams" className="flex items-center gap-4" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)'; e.currentTarget.style.color = 'var(--primary)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
              <BookOpen size={20} /> Exams
            </Link>
          </li>
        </ul>
      </nav>
      <div style={{ padding: '1.5rem' }}>
        <ul className="flex flex-col gap-2" style={{ listStyle: 'none' }}>
          <li>
            <Link href="#" className="flex items-center gap-4" style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
              <Settings size={20} /> Settings
            </Link>
          </li>
          <li>
            <Link href="#" className="flex items-center gap-4" style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
              <HelpCircle size={20} /> Help Center
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
