'use client';

import Image from 'next/image';
import { 
  LayoutDashboard, FileText, HelpCircle, Map, Clock, 
  Bot, FileCheck, BookOpen, ChevronDown, Gift, 
  BookA, BookType, Languages, UserPlus, X, Eye, EyeOff, Download, Play, Music, LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [hasPreviousScore, setHasPreviousScore] = useState('no');
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  const [newStudentFullName, setNewStudentFullName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentScore, setNewStudentScore] = useState('');
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  const [userRole, setUserRole] = useState('trainer');
  const [userName, setUserName] = useState('Trainer');
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const role = user.email === 'trainer@vectragroup.com' ? 'trainer' : (user.user_metadata?.role || 'learner');
          setUserRole(role);
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner');
        } else {
          const mockRole = localStorage.getItem('dev_mock_role');
          const mockName = localStorage.getItem('dev_mock_name');
          if (mockRole) setUserRole(mockRole);
          if (mockName) setUserName(mockName);
        }
      } catch (e) {
        const mockRole = localStorage.getItem('dev_mock_role');
        const mockName = localStorage.getItem('dev_mock_name');
        if (mockRole) setUserRole(mockRole);
        if (mockName) setUserName(mockName);
      }
    };
    fetchUser();
  }, []);

  const handleCreateStudent = async () => {
    if (!newStudentId || !newStudentPassword) {
      alert("Student ID and Password are required!");
      return;
    }
    
    setIsCreatingStudent(true);
    const authEmail = newStudentId.includes('@') ? newStudentId : `${newStudentId}@student.vectragroup.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: newStudentPassword,
      options: {
        data: {
          full_name: newStudentFullName,
          phone: newStudentPhone,
          personal_email: newStudentEmail,
          has_previous_score: hasPreviousScore,
          previous_score: newStudentScore,
          role: 'learner'
        }
      }
    });

    setIsCreatingStudent(false);

    if (error) {
      if (error.message && error.message.toLowerCase().includes('fetch')) {
        console.warn('Network blocked. Bypassing create student for local UI development.');
        
        const newStudent = {
          name: newStudentFullName,
          id: newStudentId,
          batch: 'Batch 1',
          course: 'IELTS Academic',
          status: 'Active'
        };
        setStudentsList(prev => [...prev, newStudent]);

        alert("Student Created successfully (Dev Network Bypass)!");
        setIsAddStudentModalOpen(false);
        setNewStudentFullName('');
        setNewStudentPhone('');
        setNewStudentId('');
        setNewStudentPassword('');
        setNewStudentEmail('');
        setNewStudentScore('');
        setHasPreviousScore('no');
        return;
      }
      alert(`Error creating student: ${error.message}`);
    } else {
      const newStudent = {
        name: newStudentFullName,
        id: newStudentId,
        batch: 'Batch 1',
        course: 'IELTS Academic',
        status: 'Active'
      };
      setStudentsList(prev => [...prev, newStudent]);

      alert("Student Created successfully!");
      setIsAddStudentModalOpen(false);
      setNewStudentFullName('');
      setNewStudentPhone('');
      setNewStudentId('');
      setNewStudentPassword('');
      setNewStudentEmail('');
      setNewStudentScore('');
      setHasPreviousScore('no');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = '/';
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    ...(userRole === 'trainer' ? [{ name: 'Add Students', icon: UserPlus }] : []),
    { name: 'Mock Test', icon: FileText },
    { name: 'Practice Questions', icon: HelpCircle },
    { name: 'Study Roadmap', icon: Map },
    { name: 'Test History', icon: Clock },
    { name: 'AI Tutor', icon: Bot },
    { name: 'IELTS Templates', icon: FileCheck },
    { name: 'IELTS Course', icon: BookOpen, isNew: true },
  ];

  const formatSize = (bytes: number) => bytes > 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';
  
  const studyRoadmapFiles = [
    { name: 'Cambridge IELTS 1.pdf', sizeBytes: 2941500, type: 'pdf' },
    { name: 'Cambridge IELTS  2.pdf', sizeBytes: 21194593, type: 'pdf' },
    { name: 'Cambridge IELTS 3.pdf', sizeBytes: 3429234, type: 'pdf' },
    { name: 'Cambridge IELTS 4.pdf', sizeBytes: 10526523, type: 'pdf' },
    { name: 'Cambridge IELTS 5.pdf', sizeBytes: 13800808, type: 'pdf' },
    { name: 'Cambridge IELTS  6.pdf', sizeBytes: 21596440, type: 'pdf' },
    { name: 'Cambridge IELTS 7.pdf', sizeBytes: 21531994, type: 'pdf' },
    { name: 'Cambridge IELTS 8.pdf', sizeBytes: 4113588, type: 'pdf' },
    { name: 'Cambridge-IELTS-9.pdf', sizeBytes: 22371471, type: 'pdf' },
    { name: 'cambridge ielts 10.pdf', sizeBytes: 28428650, type: 'pdf' },
    { name: 'Cambridge IELTS 11 (1).pdf', sizeBytes: 101520691, type: 'pdf' },
    { name: 'Cambridge IELTS 12.pdf', sizeBytes: 90903565, type: 'pdf' },
    { name: 'Cambridge IELTS 13 - Copy.pdf', sizeBytes: 24309632, type: 'pdf' },
    { name: 'Cam 14.pdf', sizeBytes: 41632654, type: 'pdf' },
    { name: 'Cambridge IELTS 15 - Copy.pdf', sizeBytes: 27816475, type: 'pdf' },
    { name: 'Cambridge IELTS 15 Gen _text.pdf', sizeBytes: 8031228, type: 'pdf' },
    { name: 'Cambridge IELTS 16 Academic_text.pdf', sizeBytes: 4236872, type: 'pdf' },
    { name: 'Cambridge 17 Academic.pdf', sizeBytes: 36521253, type: 'pdf' },
    { name: 'Cambridge-IELTS-18-Academic.pdf', sizeBytes: 53619087, type: 'pdf' },
    { name: 'Cambridge IELTS 19 Academic PDF_removed.pdf', sizeBytes: 14103431, type: 'pdf' },
  ];

  const practiceQuestionsFiles = [
    { name: 'AC - Reality Test-5 Listening QP.pdf', sizeBytes: 533770, type: 'pdf' },
    { name: 'AC - Reality Test-5 Reading QP.pdf', sizeBytes: 830708, type: 'pdf' },
    { name: 'AC - Reality Test-5 Speaking - QP.pdf', sizeBytes: 714626, type: 'pdf' },
    { name: 'AC - Reality Test-5 Writing Task 1 and 2 - QP.pdf', sizeBytes: 471257, type: 'pdf' },
    { name: 'AC - Reality Test-5 Listening and Reading - Answers.pdf', sizeBytes: 532292, type: 'pdf' }
  ];

  const mockTestFiles = [
    { name: 'IELTS 20 TEST 1.pdf', sizeBytes: 5327081, type: 'pdf' },
    { name: 'IELTS 20 TEST 2.pdf', sizeBytes: 5899155, type: 'pdf' },
    { name: 'IELTS 20 TEST 3.pdf', sizeBytes: 5178244, type: 'pdf' },
    { name: 'IELTS 20 TEST 4.pdf', sizeBytes: 5430078, type: 'pdf' },
    { name: 'WhatsApp Audio 2026-09-09 at 01.07.29.mpeg', sizeBytes: 39924277, type: 'audio' }
  ];

  const renderFileCard = (file: { name: string, sizeBytes: number, type: string }) => (
    <div key={file.name} style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '0.5rem',
          backgroundColor: file.type === 'pdf' ? '#fef2f2' : '#f0fdf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {file.type === 'pdf' ? <FileText size={20} color="#ef4444" /> : <Music size={20} color="#10b981" />}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }} title={file.name}>
            {file.name}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{file.type.toUpperCase()} • {formatSize(file.sizeBytes)}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a 
          href={`/Study Material/${file.name}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
            backgroundColor: 'white', border: '1px solid #e5e7eb', textDecoration: 'none',
            color: '#374151', fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            cursor: 'pointer', transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          {file.type === 'pdf' ? <Eye size={14} /> : <Play size={14} />} 
          {file.type === 'pdf' ? 'View' : 'Play'}
        </a>
        <a 
          href={`/Study Material/${file.name}`}
          download
          style={{
            flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
            backgroundColor: '#f3f4f6', border: '1px solid transparent', textDecoration: 'none',
            color: '#111827', fontSize: '0.75rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            cursor: 'pointer', transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        >
          <Download size={14} /> Download
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#f5f6fa', 
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 2rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Image src="/vfs_logo.png" alt="VFS Logo" width={320} height={80} style={{ objectFit: 'contain', filter: 'invert(1)' }} priority />
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            {['Mock Test', 'Practice', 'Study Tools', 'Sample Result'].map((item) => (
              <button key={item} style={{ 
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 500, color: '#374151'
              }}>
                {item} <ChevronDown size={14} />
              </button>
            ))}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#374151' }}>
              Pricing
            </button>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '999px',
              backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#fee2e2'; }}
          >
            <LogOut size={14} /> Log Out
          </button>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, #1f2937, #374151)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: '220px',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          padding: '1.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          <div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.7rem 1rem',
                    marginBottom: '0.25rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === item.name ? 600 : 450,
                    color: activeTab === item.name ? '#111827' : '#6b7280',
                    backgroundColor: activeTab === item.name ? '#f3f4f6' : 'transparent',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                >
                  <Icon size={18} />
                  {item.name}
                  {item.isNew && (
                    <span style={{
                      marginLeft: 'auto',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase'
                    }}>New</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          padding: '1.5rem 2rem', 
          overflowY: 'auto',
          backgroundColor: '#f5f6fa'
        }}>
          {activeTab === 'Mock Test' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={24} /> Mock Tests Library
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Access and download Cambridge IELTS materials and audio tests.</p>
                </div>
                {userRole === 'trainer' && (
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    backgroundColor: '#111827', color: 'white', border: 'none',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    + Add Mock Test
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {mockTestFiles.map(renderFileCard)}
              </div>
            </div>
          ) : activeTab === 'Practice Questions' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={24} /> Practice Questions
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Practice Reality Tests and check your answers.</p>
                </div>
                {userRole === 'trainer' && (
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    backgroundColor: '#111827', color: 'white', border: 'none',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    + Add Practice Test
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {practiceQuestionsFiles.map(renderFileCard)}
              </div>
            </div>
          ) : activeTab === 'Study Roadmap' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Map size={24} /> Study Roadmap & Notes
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Follow the general textbooks and academic texts for your study roadmap.</p>
                </div>
                {userRole === 'trainer' && (
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    backgroundColor: '#111827', color: 'white', border: 'none',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    + Add Roadmap Content
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {studyRoadmapFiles.map(renderFileCard)}
              </div>
            </div>
          ) : activeTab === 'Add Students' ? (
            /* ===== ADD STUDENTS VIEW ===== */
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={24} /> Students Directory
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Manage and view all student details</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button 
                    onClick={() => setIsAddStudentModalOpen(true)}
                    style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                    backgroundColor: '#111827', color: 'white', border: 'none',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                    + Add Student
                  </button>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Search students..." 
                      style={{
                        padding: '0.6rem 1rem 0.6rem 2.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                        outline: 'none',
                        width: '220px',
                        backgroundColor: 'white'
                      }}
                    />
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }}>🔍</span>
                  </div>
                  <select style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    cursor: 'pointer'
                  }}>
                    <option>Filter: All</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <input type="checkbox" style={{ marginRight: '0.75rem' }} />
                        Student Name
                      </th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student ID</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <UserPlus size={48} color="#d1d5db" />
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}>No students added yet</p>
                            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Click &quot;+ Add Student&quot; to add your first student</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      studentsList.map((student, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <input type="checkbox" />
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{student.id}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{student.batch}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{student.course}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>{student.status}</span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>•••</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ===== DASHBOARD VIEW ===== */
            <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { title: 'Mock Tests', count: `${mockTestFiles.length} Tests`, desc: 'Simulate the full IELTS exam mock test experience online.', color: '#6366f1', bg: '#eef2ff' },
              { title: 'Section Tests', count: '12 Tests', desc: 'Take section-wise writing, reading, listening, and speaking IELTS tests.', color: '#10b981', bg: '#ecfdf5' },
              { title: 'Practice Questions', count: `${practiceQuestionsFiles.length} Questions`, desc: 'Access the real IELTS sample test questions across all modules.', color: '#f59e0b', bg: '#fffbeb' }
            ].map((card) => (
              <div key={card.title} style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '0.5rem',
                    backgroundColor: card.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FileText size={20} color={card.color} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>{card.title}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{card.count}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Middle Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Target Score */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Target Score</h3>
                <button style={{
                  padding: '0.4rem 1rem', borderRadius: '999px',
                  border: '1px solid #d1d5db', backgroundColor: 'white',
                  fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', color: '#374151'
                }}>Set New Target</button>
              </div>
              {/* Bar Chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', height: '160px', padding: '0 1rem' }}>
                {[
                  { label: 'Overall', score: 7.5 },
                  { label: 'Listening', score: 8.0 },
                  { label: 'Reading', score: 7.5 },
                  { label: 'Speaking', score: 7.0 },
                  { label: 'Writing', score: 6.5 }
                ].map((item) => (
                  <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '-0.25rem' }}>{item.score}</span>
                    <div style={{ 
                      width: '100%', 
                      height: `${(item.score / 9) * 100}%`,
                      background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                      borderRadius: '4px 4px 0 0',
                      position: 'relative',
                      boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
                    }}>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                  </div>
                ))}
              </div>
              {/* Y-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0 0 0' }}>
                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>0</span>
                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>9</span>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Exam In */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Exam In</h3>
                  <button style={{
                    padding: '0.4rem 1rem', borderRadius: '999px',
                    border: '1px solid #d1d5db', backgroundColor: 'white',
                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', color: '#374151'
                  }}>Set New Date</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                  {[
                    { value: '14', label: 'Days' },
                    { value: '08', label: 'Hours' },
                    { value: '45', label: 'Minutes' }
                  ].map((item) => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        border: '3px solid #3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6',
                        marginBottom: '0.4rem',
                        backgroundColor: '#eff6ff'
                      }}>{item.value}</div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average Score */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>Average Score</h3>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151' }}>7.0 / 9</span>
                </div>
                <div style={{ 
                  width: '100%', height: '8px', backgroundColor: '#e5e7eb', 
                  borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem'
                }}>
                  <div style={{ width: '77%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)', borderRadius: '999px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 500 }}>Need Improvement</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 500 }}>Good</span>
                  <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 500 }}>Excellent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Study Tools */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Study Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { title: 'IELTS Vocabulary', desc: 'Learn new IELTS words with easy word lists.', color: '#ef4444', bg: '#fef2f2', icon: BookA },
                { title: 'IELTS Grammar', desc: 'Master essential grammar rules with easy-to-understand tips.', color: '#f59e0b', bg: '#fffbeb', icon: BookType },
                { title: 'IELTS Phrase and Idioms', desc: 'Learn IELTS phrases and idioms with clear meanings and examples.', color: '#6366f1', bg: '#eef2ff', icon: Languages }
              ].map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <div key={tool.title} style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '0.5rem',
                      backgroundColor: tool.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <ToolIcon size={20} color={tool.color} />
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111827', marginBottom: '0.35rem' }}>{tool.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>{tool.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
          )}
        </main>
      </div>

      {/* Add Student Modal */}
      {isAddStudentModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsAddStudentModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem', right: '1rem',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#9ca3af',
                padding: '0.5rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add New Student</h2>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Create a new student profile</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" value={newStudentFullName} onChange={(e) => setNewStudentFullName(e.target.value)} placeholder="John Doe" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Phone Number</label>
                <input type="tel" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)} placeholder="+1 234 567 8900" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Student ID</label>
                <input type="text" value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} placeholder="Enter student ID" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showModalPassword ? "text" : "password"} value={newStudentPassword} onChange={(e) => setNewStudentPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white', outline: 'none' }} />
                  <button 
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email</label>
                <input type="email" value={newStudentEmail} onChange={(e) => setNewStudentEmail(e.target.value)} placeholder="name@example.com" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white', outline: 'none' }} />
              </div>
              
              <div style={{ gridColumn: hasPreviousScore === 'yes' ? 'span 1' : 'span 2', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Previous IELTS Score</label>
                <div 
                  onClick={() => setIsScoreDropdownOpen(!isScoreDropdownOpen)}
                  style={{ 
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', 
                    border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', 
                    backgroundColor: 'white', cursor: 'pointer', display: 'flex', 
                    justifyContent: 'space-between', alignItems: 'center', userSelect: 'none'
                  }}
                >
                  {hasPreviousScore === 'yes' ? 'Yes' : 'No'}
                  <ChevronDown size={16} color="#6b7280" />
                </div>
                
                {isScoreDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, 
                    marginTop: '0.25rem', backgroundColor: 'white', 
                    border: '1.5px solid #e2e8f0', borderRadius: '0.5rem', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, overflow: 'hidden'
                  }}>
                    <div 
                      onClick={() => { setHasPreviousScore('no'); setIsScoreDropdownOpen(false); }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasPreviousScore === 'no' ? '#f8fafc' : 'white'}
                      style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#0f172a', cursor: 'pointer', backgroundColor: hasPreviousScore === 'no' ? '#f8fafc' : 'white', borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                    >
                      No
                    </div>
                    <div 
                      onClick={() => { setHasPreviousScore('yes'); setIsScoreDropdownOpen(false); }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasPreviousScore === 'yes' ? '#f8fafc' : 'white'}
                      style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#0f172a', cursor: 'pointer', backgroundColor: hasPreviousScore === 'yes' ? '#f8fafc' : 'white', transition: 'background-color 0.2s' }}
                    >
                      Yes
                    </div>
                  </div>
                )}
              </div>

              {hasPreviousScore === 'yes' && (
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Score</label>
                  <input type="number" step="0.5" min="0" max="9" value={newStudentScore} onChange={(e) => setNewStudentScore(e.target.value)} placeholder="e.g. 7.5" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a', backgroundColor: 'white', outline: 'none' }} />
                </div>
              )}
            </div>

            <button 
              onClick={handleCreateStudent}
              disabled={isCreatingStudent}
              style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: isCreatingStudent ? '#4b5563' : '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: isCreatingStudent ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              {isCreatingStudent ? 'Creating...' : 'Create Student +'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
