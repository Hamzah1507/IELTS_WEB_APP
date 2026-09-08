'use client';
import { Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/login' || pathname === '/dashboard') return null;

  return (
    <header className="navbar">
      <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
        Welcome back, Student!
      </div>
      <div className="flex items-center gap-4">
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2" style={{ padding: '0.5rem', background: 'var(--background)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={16} />
          </div>
          <span style={{ paddingRight: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Student Profile</span>
        </div>
      </div>
    </header>
  );
}
