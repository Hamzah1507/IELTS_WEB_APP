'use client';

import Image from 'next/image';
import {
  LayoutDashboard, FileText, HelpCircle, Map, Clock,
  Bot, FileCheck, BookOpen, ChevronDown, Gift,
  BookA, BookType, Languages, UserPlus, X, Eye, EyeOff, Download, Play, Music, LogOut, Menu, Bell
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('activeTab') || 'Dashboard';
    return 'Dashboard';
  });
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') localStorage.setItem('activeTab', tab);
  };
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasPreviousScore, setHasPreviousScore] = useState('no');
  const [isScoreDropdownOpen, setIsScoreDropdownOpen] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [newStudentFullName, setNewStudentFullName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentScore, setNewStudentScore] = useState('');
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  const [userRole, setUserRole] = useState('trainer');
  const [userName, setUserName] = useState('Trainer');
  const [isLoading, setIsLoading] = useState(true);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [extraPracticeFiles, setExtraPracticeFiles] = useState<{ id?: string, name: string, sizeBytes: number, type: string, url: string }[]>([]);
  const [extraRoadmapFiles, setExtraRoadmapFiles] = useState<{ id?: string, name: string, sizeBytes: number, type: string, url: string }[]>([]);
  const [openMenuFile, setOpenMenuFile] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [editingStudent, setEditingStudent] = useState<{ student: any, idx: number } | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [openStudentMenu, setOpenStudentMenu] = useState<number | null>(null);
  const practiceFileInputRef = useRef<HTMLInputElement>(null);
  const roadmapFileInputRef = useRef<HTMLInputElement>(null);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<{ role: string, text: string }[]>([
    { role: 'bot', text: 'Hello! I am your AI Assistant. I specialize in IELTS, PTE, TOEFL preparation, and immigration-related inquiries. How can I help you today?' }
  ]);

  const [currentMockQuestionIndex, setCurrentMockQuestionIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<number[][]>([[], []]);
  const [isMockSubmitted, setIsMockSubmitted] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);

  const mockQuestions = [
    {
      id: 1,
      type: "Single response (Select one correct response)",
      prompt: "Read the text and answer the question by selecting the correct response. You can only select one response.",
      text: "Teachers have endless possibilities when it comes to the methods of teaching that they can use but, in reality, most of the time they use fairly traditional methods of teaching. Arguably the most common method is the Instructor Based model. This method has the teacher as the focus of the class and tends to involve the teacher explaining the subject with little or no student interaction or input.\n\nThis may be the easiest and simplest method but its effect is reduced because of the short attention span many students have. Since teachers don't interact with their students when they are using Instructor Based teaching models, most students lose focus and their mind tends to wander; without feedback from the students, it is possible for the teacher to continue without knowing if the students have understood, or indeed if they are even listening. What is more, students are less likely to listen carefully when they are not playing an active part in the lesson.",
      question: "What does the writer say about teaching methods?",
      options: [
        "Teachers do not use the Instructor Based model as much as they used to.",
        "A problem with the Instruction Based Model is that students cannot concentrate for a long time.",
        "Traditionally, teachers have encouraged students to interact in the classroom.",
        "The Instructor Based model is difficult for teachers as all of the focus is on them.",
        "Teachers using the Instructor Based model may not know if their students are following the lesson."
      ],
      correctOptions: [4]
    },
    {
      id: 2,
      type: "Single response (Select one correct response)",
      prompt: "Read the text and answer the question by selecting the correct response. You can only select one response.",
      text: "Daylight Saving Time (DST) is the practice of putting clocks forward during the warmer months of the year so it becomes dark later each day. The usual way of operating DST is to put clocks forward by one hour in the spring and back an hour in autumn. DST goes back to 1908 when it was introduced in Ontario, Canada. Since then, several countries have used it at various times. Its use isn't, however, found everywhere. Countries in Asia and Africa generally don't use it. In countries where it is used, some people question whether the practice is still useful.\n\nIn this article, we consider the arguments for and against DST. The discussion covers some key areas in which DST has an effect: energy use, the economy, public safety, and health. DST supporters argue that it decreases energy consumption by reducing the need for heating and lighting. However, research shows that although electricity savings are greater for countries further away from the equator, the line on a map dividing the northern and southern halves of the Earth, electricity use in regions near that line increases. Shops benefit from more people being out spending money. However, some farmers suffer because of the limited hours available to gather crops or milk cows. Increased daylight benefits public safety. A recent study showed that full-year DST would make roads easier to see and safer for drivers and pedestrians, but other research is less confident about its advantages. With respect to health, more daylight hours mean more time to spend on outdoor activities. However, sleep patterns can be interrupted. The costs and benefits clearly change between places and local activities.",
      question: "According to the text, which of the following are true statements about Daylight Saving Time (DST)?",
      options: [
        "It was first used in Canada.",
        "Its use causes problems in dairy farming because of increased fuel costs.",
        "It has been proved to make driving less safe at certain times.",
        "It is no longer considered a good idea by everyone in some places.",
        "Its ability to reduce fuel use depends on where in the world it is used."
      ],
      correctOptions: [3]
    }
  ];

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
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();

    // Fetch students from Supabase, fall back to localStorage
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: true });
        if (data && !error) {
          const mapped = data.map((s: any) => ({
            name: s.name,
            id: s.student_id,
            phone: s.phone,
            email: s.email,
            batch: s.batch,
            course: s.course,
            status: s.status,
            hasPreviousScore: s.has_previous_score,
            previousScore: s.previous_score
          }));
          setStudentsList(mapped);
          localStorage.setItem('dev_mock_students', JSON.stringify(mapped));
          return;
        }
      } catch (e) { }
      // Fallback to localStorage if Supabase unreachable
      const savedStudents = localStorage.getItem('dev_mock_students');
      if (savedStudents) {
        try { setStudentsList(JSON.parse(savedStudents)); } catch (e) { }
      }
    };
    fetchStudents();
    const fetchMaterials = async () => {
      const { data, error } = await supabase.from('study_materials').select('*');
      if (data && !error) {
        const practice = data.filter((d: any) => d.section === 'practice').map((d: any) => ({
          id: d.id, name: d.name, sizeBytes: d.size_bytes, type: d.type, url: d.url
        }));
        const roadmap = data.filter((d: any) => d.section === 'roadmap').map((d: any) => ({
          id: d.id, name: d.name, sizeBytes: d.size_bytes, type: d.type, url: d.url
        }));
        setExtraPracticeFiles(practice);
        setExtraRoadmapFiles(roadmap);
      }
    };
    fetchMaterials();

    // ===== SUPABASE REALTIME SUBSCRIPTIONS =====
    const studentsSubscription = supabase.channel('realtime:students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents();
      })
      .subscribe();

    const materialsSubscription = supabase.channel('realtime:study_materials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_materials' }, () => {
        fetchMaterials();
      })
      .subscribe();

    // Cleanup subscriptions when component unmounts
    return () => {
      supabase.removeChannel(studentsSubscription);
      supabase.removeChannel(materialsSubscription);
    };
  }, []);

  const handleCreateStudent = async () => {
    if (!newStudentId || !newStudentPassword) {
      alert("Student ID and Password are required!");
      return;
    }

    // Always save locally first with ALL fields — phone, email, etc.
    const newStudent = {
      name: newStudentFullName,
      id: newStudentId,
      phone: newStudentPhone,
      email: newStudentEmail,
      previousScore: newStudentScore,
      hasPreviousScore,
      batch: 'Batch 1',
      course: 'IELTS Academic',
      status: 'Active'
    };
    setStudentsList(prev => {
      const updated = [...prev, newStudent];
      localStorage.setItem('dev_mock_students', JSON.stringify(updated));
      return updated;
    });
    setIsAddStudentModalOpen(false);
    setNewStudentFullName('');
    setNewStudentPhone('');
    setNewStudentId('');
    setNewStudentPassword('');
    setNewStudentEmail('');
    setNewStudentScore('');
    setHasPreviousScore('no');

    // Then attempt Supabase auth + DB insert silently in the background
    setIsCreatingStudent(true);
    const authEmail = newStudentId.includes('@') ? newStudentId : `${newStudentId}@student.vectragroup.com`;
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password: newStudentPassword,
        options: {
          data: {
            full_name: newStudent.name,
            phone: newStudent.phone,
            personal_email: newStudent.email,
            has_previous_score: hasPreviousScore,
            previous_score: newStudentScore,
            role: 'learner'
          }
        }
      });

      if (signUpError) {
        alert(`Supabase Error: ${signUpError.message}`);
        setIsCreatingStudent(false);
        return;
      }

      // Insert into students table
      await supabase.from('students').insert({
        name: newStudent.name,
        student_id: newStudent.id,
        phone: newStudent.phone,
        email: newStudent.email,
        batch: newStudent.batch,
        course: newStudent.course,
        status: newStudent.status,
        has_previous_score: newStudent.hasPreviousScore,
        previous_score: newStudent.previousScore
      });
    } catch (e) {
      // Supabase unreachable in dev — student already saved locally above
    } finally {
      setIsCreatingStudent(false);
    }
  };

  const handleAddPracticeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingFiles(true);
    try {
      await Promise.all(files.map(async (file) => {
        const fileType = file.type.includes('pdf') ? 'pdf' : 'audio';
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

        const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file);
        if (uploadError) {
          alert(`Upload failed for ${file.name}: ` + uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(fileName);

        const { data: dbData, error: dbError } = await supabase.from('study_materials').insert({
          name: file.name,
          size_bytes: file.size,
          type: fileType,
          url: publicUrlData.publicUrl,
          section: 'practice'
        }).select().single();

        if (dbError) {
          alert(`Database save failed for ${file.name}: ` + dbError.message);
          return;
        }

        const newFile = { id: dbData.id, name: file.name, sizeBytes: file.size, type: fileType, url: publicUrlData.publicUrl };
        setExtraPracticeFiles(prev => [...prev, newFile]);
      }));
    } finally {
      setIsUploadingFiles(false);
      if (practiceFileInputRef.current) practiceFileInputRef.current.value = '';
    }
  };

  const handleAddRoadmapFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploadingFiles(true);
    try {
      await Promise.all(files.map(async (file) => {
        const fileType = file.type.includes('pdf') ? 'pdf' : 'audio';
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;

        const { error: uploadError } = await supabase.storage.from('materials').upload(fileName, file);
        if (uploadError) {
          alert(`Upload failed for ${file.name}: ` + uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(fileName);

        const { data: dbData, error: dbError } = await supabase.from('study_materials').insert({
          name: file.name,
          size_bytes: file.size,
          type: fileType,
          url: publicUrlData.publicUrl,
          section: 'roadmap'
        }).select().single();

        if (dbError) {
          alert(`Database save failed for ${file.name}: ` + dbError.message);
          return;
        }

        const newFile = { id: dbData.id, name: file.name, sizeBytes: file.size, type: fileType, url: publicUrlData.publicUrl };
        setExtraRoadmapFiles(prev => [...prev, newFile]);
      }));
    } finally {
      setIsUploadingFiles(false);
      if (roadmapFileInputRef.current) roadmapFileInputRef.current.value = '';
    }
  };

  const handleDeleteExtraFile = async (fileObj: any, section: 'practice' | 'roadmap') => {
    if (fileObj.id) {
      const { error } = await supabase.from('study_materials').delete().eq('id', fileObj.id);
      if (error) {
        alert('Failed to delete file from database: ' + error.message);
        return;
      }
    }
    if (section === 'practice') {
      setExtraPracticeFiles(prev => prev.filter(f => f.name !== fileObj.name));
    } else {
      setExtraRoadmapFiles(prev => prev.filter(f => f.name !== fileObj.name));
    }
    setOpenMenuFile(null);
  };

  const confirmLogout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      window.location.href = '/';
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    ...(userRole === 'trainer' ? [{ name: 'Add Students', icon: UserPlus }] : []),
    { name: 'Practice Questions', icon: HelpCircle },
    { name: 'Resources', icon: FileText },
    { name: 'Mock Test', icon: Clock },
    { name: 'AI Tutor', icon: Bot },
  ];

  const formatSize = (bytes: number) => bytes > 1024 * 1024 ? (bytes / (1024 * 1024)).toFixed(1) + ' MB' : Math.round(bytes / 1024) + ' KB';

  const studyRoadmapFiles: { name: string; sizeBytes: number; type: string }[] = [];

  const practiceQuestionsFiles: { name: string; sizeBytes: number; type: string }[] = [];

  const mockTestFiles: any[] = [];


  const renderFileCard = (file: { name: string, sizeBytes: number, type: string, url?: string }, onDelete?: () => void) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '0.5rem',
          backgroundColor: file.type === 'pdf' ? '#fef2f2' : '#f0fdf4',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {file.type === 'pdf' ? <FileText size={20} color="#ef4444" /> : <Music size={20} color="#10b981" />}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }} title={file.name}>
            {file.name}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{file.type.toUpperCase()} • {formatSize(file.sizeBytes)}</p>
        </div>
        {onDelete && userRole === 'trainer' && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setOpenMenuFile(openMenuFile === file.name ? null : file.name)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem', color: '#6b7280', fontSize: '1.1rem', lineHeight: 1 }}
              title="Options"
            >⋯</button>
            {openMenuFile === file.name && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', backgroundColor: 'white',
                border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50, minWidth: '120px', overflow: 'hidden'
              }}>
                <button
                  onClick={() => onDelete()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    width: '100%', padding: '0.6rem 0.75rem', border: 'none',
                    backgroundColor: 'white', color: '#ef4444', fontSize: '0.8rem',
                    fontWeight: 600, cursor: 'pointer', textAlign: 'left'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a
          href={file.url || `/Study Material/${file.name}`}
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
          href={file.url || `/Study Material/${file.name}`}
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

  if (isLoading) return null;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111827', display: 'flex', alignItems: 'center', padding: '0.25rem', borderRadius: '0.25rem' }}
          >
            <Menu size={24} />
          </button>
          <Image src="/vfs_logo.png" alt="VFS Logo" width={320} height={80} style={{ objectFit: 'contain', filter: 'invert(1)' }} priority />

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 700 }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.1rem' }}>
                {userRole === 'trainer' ? 'Tutor' : 'Student'}
              </div>
            </div>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#e2e8f0' }}></div>

          <button
            onClick={handleLogoutClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '999px',
              backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {isSidebarOpen && (
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
                    onClick={() => handleTabChange(item.name)}
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
                    {(item as any).isNew && (
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
        )}

        {/* Main Content */}
        <main className="animate-tab-content" style={{
          flex: 1,
          padding: '1.5rem 2rem',
          overflowY: 'auto',
          backgroundColor: '#f5f6fa'
        }} key={activeTab}>
          {activeTab === 'Practice Questions' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={24} /> Practice Questions
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Practice Reality Tests and check your answers.</p>
                </div>
                {userRole === 'trainer' && (
                  <>
                    <input
                      ref={practiceFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.mp3,.mpeg,.wav,.m4a"
                      style={{ display: 'none' }}
                      onChange={handleAddPracticeFile}
                    />
                    <button
                      onClick={() => practiceFileInputRef.current?.click()}
                      disabled={isUploadingFiles}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                        backgroundColor: isUploadingFiles ? '#9ca3af' : '#111827', color: 'white', border: 'none',
                        fontSize: '0.85rem', fontWeight: 600, cursor: isUploadingFiles ? 'not-allowed' : 'pointer'
                      }}>
                      {isUploadingFiles ? 'Uploading...' : '+ Add Practice Test'}
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {practiceQuestionsFiles.map((file, i) => <div key={`static-practice-${i}-${file.name}`}>{renderFileCard(file)}</div>)}
                {extraPracticeFiles.map((file, i) => <div key={`extra-practice-${i}-${file.name}`}>{renderFileCard(
                  { name: file.name, sizeBytes: file.sizeBytes, type: file.type, url: file.url },
                  () => handleDeleteExtraFile(file, 'practice')
                )}</div>)}
              </div>
            </div>
          ) : activeTab === 'Resources' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={24} /> Resources
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Access and download test materials.</p>
                </div>
                {userRole === 'trainer' && (
                  <>
                    <input
                      ref={roadmapFileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.mp3,.mpeg,.wav,.m4a"
                      style={{ display: 'none' }}
                      onChange={handleAddRoadmapFile}
                    />
                    <button
                      onClick={() => roadmapFileInputRef.current?.click()}
                      disabled={isUploadingFiles}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.25rem', borderRadius: '0.5rem',
                        backgroundColor: isUploadingFiles ? '#9ca3af' : '#111827', color: 'white', border: 'none',
                        fontSize: '0.85rem', fontWeight: 600, cursor: isUploadingFiles ? 'not-allowed' : 'pointer'
                      }}>
                      {isUploadingFiles ? 'Uploading...' : '+ Add Roadmap Content'}
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {studyRoadmapFiles.map((file, i) => <div key={`static-roadmap-${i}-${file.name}`}>{renderFileCard(file)}</div>)}
                {extraRoadmapFiles.map((file, i) => <div key={`extra-roadmap-${i}-${file.name}`}>{renderFileCard(
                  { name: file.name, sizeBytes: file.sizeBytes, type: file.type, url: file.url },
                  () => handleDeleteExtraFile(file, 'roadmap')
                )}</div>)}
              </div>
            </div>
          ) : activeTab === 'Mock Test' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={24} /> Mock Test
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>View and manage your mock tests.</p>
                </div>
              </div>
              <div style={{ backgroundColor: 'white', color: '#111827', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '650px', fontFamily: 'system-ui, -apple-system, sans-serif', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ padding: '1rem 2rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>PTE Academic Mock Test</h3>
                  <span style={{ backgroundColor: '#e2e8f0', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    Question {currentMockQuestionIndex + 1} of {mockQuestions.length}
                  </span>
                </div>

                {showResultsScreen ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#f8fafc', position: 'relative' }}>
                    <div style={{ width: '400px', padding: '3rem 2rem', borderRadius: '1.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', animation: 'mock-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
                      <style>{`
                        @keyframes mock-pulse {
                          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); border-color: #e2e8f0; }
                          50% { box-shadow: 0 0 25px 5px rgba(99, 102, 241, 0.15); border-color: #a5b4fc; }
                        }
                      `}</style>
                      <h2 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', textAlign: 'center' }}>Test Completed!</h2>
                      <p style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 2.5rem 0', textAlign: 'center' }}>Here is your final evaluation.</p>
                      
                      <div style={{ width: '160px', height: '160px', borderRadius: '1.5rem', backgroundColor: '#f0f9ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '2px solid #bae6fd' }}>
                        <span style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Score</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                          <span style={{ color: '#0f172a', fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>
                            {mockQuestions.reduce((acc, q, idx) => acc + (mockAnswers[idx]?.length === q.correctOptions.length && mockAnswers[idx].every(val => q.correctOptions.includes(val)) ? 1 : 0), 0)}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '1.5rem', fontWeight: 700 }}>/ {mockQuestions.length}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', width: '100%' }}>
                        <div style={{ flex: 1, backgroundColor: '#ecfdf5', border: '1px solid #10b981', borderRadius: '1rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ color: '#059669', fontSize: '1.5rem', fontWeight: 800 }}>{mockQuestions.reduce((acc, q, idx) => acc + (mockAnswers[idx]?.length === q.correctOptions.length && mockAnswers[idx].every(val => q.correctOptions.includes(val)) ? 1 : 0), 0)}</span>
                          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.25rem' }}>Accurate</span>
                        </div>
                        <div style={{ flex: 1, backgroundColor: '#fef2f2', border: '1px solid #ef4444', borderRadius: '1rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 800 }}>{mockQuestions.length - mockQuestions.reduce((acc, q, idx) => acc + (mockAnswers[idx]?.length === q.correctOptions.length && mockAnswers[idx].every(val => q.correctOptions.includes(val)) ? 1 : 0), 0)}</span>
                          <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.25rem' }}>Incorrect</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowResultsScreen(false)}
                        style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '0.75rem', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%', boxShadow: '0 4px 14px 0 rgba(99,102,241,0.39)' }}
                      >
                        Review Answers
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
                    {/* Left pane: Text */}
                    <div style={{ padding: '2.5rem', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5, fontWeight: 500 }}>
                      {mockQuestions[currentMockQuestionIndex].prompt}
                    </p>
                    {mockQuestions[currentMockQuestionIndex].text.split('\n\n').map((paragraph, i) => (
                      <p key={i} style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem', color: '#334155' }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Right pane: Questions */}
                  <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      {mockQuestions[currentMockQuestionIndex].question}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                      {mockQuestions[currentMockQuestionIndex].options.map((opt, idx) => {
                        const isSelected = mockAnswers[currentMockQuestionIndex].includes(idx);
                        const isCorrect = mockQuestions[currentMockQuestionIndex].correctOptions.includes(idx);
                        let borderStyle = '1px solid #cbd5e1';
                        let bgStyle = isSelected ? '#f0f9ff' : 'white';
                        let textColor = isSelected ? '#0f172a' : '#475569';
                        
                        if (isSelected) borderStyle = '1px solid #3b82f6';

                        if (isMockSubmitted) {
                          if (isCorrect) {
                            borderStyle = '1px solid #10b981'; // Green
                            bgStyle = isSelected ? '#ecfdf5' : '#f0fdf4';
                            textColor = '#065f46';
                          } else if (isSelected && !isCorrect) {
                            borderStyle = '1px solid #ef4444'; // Red
                            bgStyle = '#fef2f2';
                            textColor = '#991b1b';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (isMockSubmitted) return;
                              setMockAnswers(prev => {
                                const newAnswers = [...prev];
                                newAnswers[currentMockQuestionIndex] = [idx];
                                return newAnswers;
                              });
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem',
                              borderRadius: '0.75rem', backgroundColor: bgStyle, border: borderStyle,
                              color: textColor, cursor: isMockSubmitted ? 'default' : 'pointer', textAlign: 'left',
                              transition: 'all 0.2s ease',
                              outline: 'none',
                              boxShadow: isSelected && !isMockSubmitted ? '0 4px 14px -4px rgba(59, 130, 246, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                            }}
                            onMouseOver={e => {
                              if (!isMockSubmitted) {
                                e.currentTarget.style.backgroundColor = isSelected ? '#f0f9ff' : '#f8fafc';
                                if (!isSelected) e.currentTarget.style.border = '1px solid #94a3b8';
                              }
                            }}
                            onMouseOut={e => {
                              if (!isMockSubmitted) {
                                e.currentTarget.style.backgroundColor = isSelected ? '#f0f9ff' : 'white';
                                if (!isSelected) e.currentTarget.style.border = '1px solid #cbd5e1';
                              }
                            }}
                          >
                            <div style={{ width: '24px', height: '24px', border: `2px solid ${isMockSubmitted && isCorrect ? '#10b981' : (isMockSubmitted && isSelected && !isCorrect) ? '#ef4444' : isSelected ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected && !isMockSubmitted ? '#3b82f6' : 'transparent', flexShrink: 0, transition: 'all 0.2s ease' }}>
                              {isSelected && !isMockSubmitted && <div style={{ width: '10px', height: '10px', backgroundColor: 'white', borderRadius: '50%' }} />}
                              {isMockSubmitted && isCorrect && <span style={{ color: '#10b981', fontSize: '16px', lineHeight: 1, fontWeight: 'bold' }}>✓</span>}
                              {isMockSubmitted && isSelected && !isCorrect && <span style={{ color: '#ef4444', fontSize: '14px', lineHeight: 1, fontWeight: 'bold' }}>✕</span>}
                            </div>
                            <span style={{ fontSize: '1.05rem', lineHeight: 1.5, fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isMockSubmitted && (
                          <div style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: mockAnswers[currentMockQuestionIndex].every(a => mockQuestions[currentMockQuestionIndex].correctOptions.includes(a)) && mockAnswers[currentMockQuestionIndex].length === mockQuestions[currentMockQuestionIndex].correctOptions.length ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: mockAnswers[currentMockQuestionIndex].every(a => mockQuestions[currentMockQuestionIndex].correctOptions.includes(a)) && mockAnswers[currentMockQuestionIndex].length === mockQuestions[currentMockQuestionIndex].correctOptions.length ? '#22c55e' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {mockAnswers[currentMockQuestionIndex].every(a => mockQuestions[currentMockQuestionIndex].correctOptions.includes(a)) && mockAnswers[currentMockQuestionIndex].length === mockQuestions[currentMockQuestionIndex].correctOptions.length ? '✅ Perfect! All correct.' : '❌ Incorrect. Review highlighted answers.'}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                          onClick={() => {
                            if (currentMockQuestionIndex > 0) {
                              setCurrentMockQuestionIndex(prev => prev - 1);
                            }
                          }}
                          disabled={currentMockQuestionIndex === 0}
                          style={{ backgroundColor: currentMockQuestionIndex > 0 ? 'white' : '#f8fafc', color: currentMockQuestionIndex > 0 ? '#475569' : '#94a3b8', border: '1px solid #cbd5e1', padding: '0.85rem 1.75rem', borderRadius: '0.75rem', fontWeight: 600, cursor: currentMockQuestionIndex > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                        >
                          Previous
                        </button>
                        
                        {currentMockQuestionIndex === mockQuestions.length - 1 ? (
                          isMockSubmitted ? (
                            <button
                              onClick={() => {
                                setCurrentMockQuestionIndex(0);
                                setMockAnswers(mockQuestions.map(() => []));
                                setIsMockSubmitted(false);
                              }}
                              style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '0.85rem 1.75rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 14px 0 rgba(99,102,241,0.39)' }}
                            >
                              Retake Test
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setIsMockSubmitted(true);
                                setShowResultsScreen(true);
                              }}
                              disabled={mockAnswers[currentMockQuestionIndex].length === 0}
                              style={{ backgroundColor: mockAnswers[currentMockQuestionIndex].length > 0 ? '#3b82f6' : '#e2e8f0', color: mockAnswers[currentMockQuestionIndex].length > 0 ? 'white' : '#94a3b8', border: 'none', padding: '0.85rem 2rem', borderRadius: '0.75rem', fontWeight: 600, cursor: mockAnswers[currentMockQuestionIndex].length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: mockAnswers[currentMockQuestionIndex].length > 0 ? '0 4px 14px -4px rgba(59, 130, 246, 0.4)' : 'none' }}
                            >
                              Submit Test
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentMockQuestionIndex(prev => prev + 1);
                            }}
                            disabled={!isMockSubmitted && mockAnswers[currentMockQuestionIndex].length === 0}
                            style={{ backgroundColor: (!isMockSubmitted && mockAnswers[currentMockQuestionIndex].length === 0) ? '#e2e8f0' : '#3b82f6', color: (!isMockSubmitted && mockAnswers[currentMockQuestionIndex].length === 0) ? '#94a3b8' : 'white', border: 'none', padding: '0.85rem 2rem', borderRadius: '0.75rem', fontWeight: 600, cursor: (!isMockSubmitted && mockAnswers[currentMockQuestionIndex].length === 0) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: (!isMockSubmitted && mockAnswers[currentMockQuestionIndex].length === 0) ? 'none' : '0 4px 14px -4px rgba(59, 130, 246, 0.4)' }}
                          >
                            Next Question
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'Add Students' && userRole === 'trainer' ? (
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
                overflow: 'visible'
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
                              <div
                                onClick={() => setSelectedStudent(student)}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span
                                onClick={() => setSelectedStudent(student)}
                                style={{ cursor: 'pointer', color: '#111827' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#4f46e5'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#111827'}
                              >{student.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{student.id}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{student.batch}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>{student.course}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>{student.status}</span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right', position: 'relative' }}>
                            <button
                              onClick={() => setOpenStudentMenu(openStudentMenu === idx ? null : idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.2rem', padding: '0.25rem 0.5rem' }}
                            >•••</button>
                            {openStudentMenu === idx && (
                              <div style={{
                                position: 'absolute', right: '1.25rem', top: '100%', backgroundColor: 'white',
                                border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 50, minWidth: '140px', overflow: 'hidden'
                              }}>
                                <button
                                  onClick={() => { setSelectedStudent(student); setOpenStudentMenu(null); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', border: 'none', backgroundColor: 'white', color: '#111827', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >👤 View Profile</button>
                                <button
                                  onClick={() => { setEditingStudent({ student, idx }); setEditPhone(student.phone || ''); setEditEmail(student.email || ''); setOpenStudentMenu(null); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', border: 'none', backgroundColor: 'white', color: '#111827', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >✏️ Edit Details</button>
                                <button
                                  onClick={async () => {
                                    // Remove from UI and localStorage instantly
                                    setStudentsList(prev => {
                                      const updated = prev.filter((_, i) => i !== idx);
                                      localStorage.setItem('dev_mock_students', JSON.stringify(updated));
                                      return updated;
                                    });
                                    setOpenStudentMenu(null);
                                    // Also delete from Supabase database
                                    try {
                                      await supabase.from('students').delete().eq('student_id', student.id);
                                    } catch (e) {
                                      // Supabase unreachable — removed from local only
                                    }
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.6rem 0.75rem', border: 'none', backgroundColor: 'white', color: '#ef4444', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >🗑 Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'Test History' ? (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={24} /> Test History
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Review your past exams and track score improvements over time.</p>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '3rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <Clock size={48} color="#d1d5db" style={{ margin: '0 auto 1rem auto' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}>No tests taken yet</p>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>Your past test results and detailed analytics will appear here.</p>
              </div>
            </div>
          ) : activeTab === 'AI Tutor' ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
              <div style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={24} /> AI Tutor Assistant
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Specialized in Immigration, IELTS, PTE, and TOEFL.</p>
              </div>
              <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#f9fafb' }}>
                  {aiChatMessages.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      {msg.role === 'user' ? (
                        <div style={{
                          maxWidth: '75%',
                          padding: '0.85rem 1.1rem',
                          borderRadius: '1rem 1rem 0 1rem',
                          backgroundColor: '#111827',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.85rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {msg.text}
                        </div>
                      ) : (
                        <div style={{
                          maxWidth: '75%',
                          padding: '0.85rem 1.1rem',
                          borderRadius: '1rem 1rem 1rem 0',
                          backgroundColor: 'white',
                          color: '#111827',
                          border: '1px solid #e5e7eb',
                          fontSize: '0.85rem',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }} dangerouslySetInnerHTML={{ __html: msg.text }} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!aiChatInput.trim()) return;

                    const userMsg = aiChatInput.trim();
                    const lowerMsg = userMsg.toLowerCase();
                    setAiChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
                    setAiChatInput('');

                    let botReply = 'I am an AI assistant specifically trained to assist you with English proficiency exams and immigration processes.\n\nWhile I am constantly learning new things, my primary focus is ensuring you get the highest possible band score on your tests and the most accurate pathways for your visa applications.\n\nPlease ask me a specific question regarding IELTS, PTE, TOEFL, or global immigration pathways, and I will be happy to provide a comprehensive guide.';
                    if (lowerMsg.includes('weather')) {
                      botReply = "I sincerely apologize, but I do not have access to real-time meteorological data or weather forecasting services.\n\nMy architecture is entirely dedicated to helping students and professionals navigate the complexities of international exams such as IELTS, PTE, and TOEFL, as well as providing detailed guidance on immigration and visa procedures.\n\nIf you have any questions regarding how to structure a Band 9 essay or what the Express Entry requirements are for Canada, I would be more than happy to assist you in great detail!";
                    } else if (lowerMsg.includes('ielts') || lowerMsg.includes('preparation')) {
                      botReply = "Preparing for the IELTS exam requires a strategic approach that balances both receptive skills (Listening and Reading) and productive skills (Speaking and Writing).\n\nFor the productive skills, I highly recommend checking out our 'Study Tools' section where you can find dedicated vocabulary lists, grammar rulebooks, and high-scoring templates. You can also paste your essays directly into this chat, and I will analyze them for lexical resource, grammatical range, and task achievement.\n\nFor receptive skills, consistency is key. Ensure you are taking at least two full 'Mock Tests' every week under timed conditions to build your stamina. Review every incorrect answer meticulously to understand the traps set by the examiners.\n\nOfficial Resource: <a href=\"https://www.ielts.org/\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">IELTS Official Website</a>";
                    } else if (lowerMsg.includes('pte') || lowerMsg.includes('toefl')) {
                      botReply = "Both PTE and TOEFL are entirely computer-based exams, which means that beyond just English proficiency, your typing speed, microphone etiquette, and familiarity with the testing software play a massive role in your final score.\n\nThe PTE Academic, in particular, relies heavily on integrated scoring. For instance, your performance in the 'Read Aloud' section heavily impacts your Reading score, not just your Speaking score. Therefore, mastering the specific algorithmic templates is crucial.\n\nSimilarly, the TOEFL iBT requires you to synthesize information across different mediums—reading a passage, listening to a lecture on the same topic, and then speaking or writing about how they relate. I can provide you with targeted exercises for these specific integrated tasks if you'd like to begin.\n\nOfficial Resources: <a href=\"https://www.pearsonpte.com/\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">PTE Official</a> | <a href=\"https://www.ets.org/toefl.html\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">TOEFL Official</a>";
                    } else if (lowerMsg.includes('immigration') || lowerMsg.includes('visa') || lowerMsg.includes('pr') || lowerMsg.includes('canada') || lowerMsg.includes('australia')) {
                      botReply = "Navigating international visa processes and permanent residency (PR) pathways can be an overwhelming journey due to the constantly changing policies and strict documentation requirements.\n\nFor Canada, the Express Entry system remains one of the most popular routes. It evaluates candidates based on the Comprehensive Ranking System (CRS), which heavily rewards younger applicants with high English proficiency (CLB 9 or higher), advanced degrees, and skilled work experience.\n\nFor Australia, the General Skilled Migration (GSM) program operates on a points-based system. Depending on your occupation, you might be eligible for a subclass 189 (Independent), 190 (State Nominated), or 491 (Regional) visa. Please let me know your specific target country, your current occupation, and your education level so I can give you a tailored pathway breakdown.\n\nOfficial Resources: <a href=\"https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">Canada Express Entry</a> | <a href=\"https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect\" target=\"_blank\" style=\"color: #3b82f6; text-decoration: underline; font-weight: 600;\">Australia SkillSelect</a>";
                    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                      botReply = "Hello there! Welcome to your personal AI Tutor and Immigration Consultant.\n\nI am equipped with a vast database of strategies, templates, and past exam questions to help you conquer the IELTS, PTE, or TOEFL. Furthermore, I stay updated on the latest immigration pathways for countries like Canada, Australia, the UK, and New Zealand.\n\nTo get started, simply ask me to evaluate an essay, explain a complex grammar rule, or outline the requirements for a specific visa category. How can I best support your journey today?";
                    }

                    setTimeout(() => {
                      setAiChatMessages(prev => [...prev, { role: 'bot', text: botReply }]);
                    }, 800);
                  }} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Ask about immigration pathways, IELTS writing tips..."
                      style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button type="submit" style={{ padding: '0 1.5rem', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}>
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : activeTab === 'IELTS Templates' ? (
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
                    <button onClick={() => alert(`Opening ${template.title}...\n\nThis template will be available in the next content update.`)} style={{ marginTop: '1rem', width: '100%', backgroundColor: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>View Template</button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'IELTS Course' ? (
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
          ) : (
            /* ===== DASHBOARD VIEW ===== */
            <div>
              {userRole === 'trainer' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Trainer Overview</h2>
                      <p style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '1rem' }}>Monitor your students, evaluations, and content library.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {[
                      { title: 'Total Enrolled Students', count: `${studentsList.length}`, subCount: 'Active Accounts', desc: 'Manage your active student roster and track their progress.', gradient: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', iconColor: '#6366f1', iconBg: 'rgba(99, 102, 241, 0.2)', icon: UserPlus, action: 'Add Students', actionText: 'View Students' },
                      { title: 'Pending Mock Tests', count: '0', subCount: 'Test Reviews', desc: 'Speaking and Writing tests awaiting your feedback.', gradient: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)', iconColor: '#fca5a5', iconBg: 'rgba(252, 165, 165, 0.2)', icon: FileText, action: 'Mock Test', actionText: 'Review Mock Tests' },
                      { title: 'Active Content Library', count: `${extraPracticeFiles.length + extraRoadmapFiles.length}`, subCount: 'Total Materials', desc: 'Manage your practice materials and resources.', gradient: 'linear-gradient(135deg, #047857 0%, #064e3b 100%)', iconColor: '#6ee7b7', iconBg: 'rgba(110, 231, 183, 0.2)', icon: BookOpen, action: 'Resources', actionText: 'Manage Resources' }
                    ].map((card) => {
                      const CardIcon = card.icon;
                      return (
                        <div key={card.title} style={{
                          background: card.gradient, borderRadius: '1rem', padding: '1.5rem',
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          color: 'white'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                              <div style={{ width: '52px', height: '52px', borderRadius: '1rem', backgroundColor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 0 }}>
                                <CardIcon size={26} color={card.iconColor} />
                              </div>
                              <div style={{ flex: 1, textAlign: 'center' }}>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{card.count}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: 0, marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.subCount}</p>
                              </div>
                            </div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{card.title}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '1.5rem' }}>{card.desc}</p>
                          </div>
                          <button
                            onClick={() => handleTabChange(card.action)}
                            style={{
                              width: '100%', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)',
                              backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 600, fontSize: '0.9rem',
                              cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                          >
                            {card.actionText} &rarr;
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Two Column Layout for Bottom Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Recent Students Table */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Recent Registrations</h3>
                        <button onClick={() => handleTabChange('Add Students')} style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}>View All Directory &rarr;</button>
                      </div>
                      {studentsList.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Profile</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course Track</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '1rem 1.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...studentsList].reverse().slice(0, 5).map((student, i) => (
                                <tr key={i} style={{ borderBottom: i === 4 || i === studentsList.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background-color 0.2s, transform 0.1s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                  <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 4px rgba(67, 56, 202, 0.2)' }}>
                                        {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                                      </div>
                                      <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{student.name}</p>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>{student.email || student.id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                      <BookOpen size={12} /> {student.course || 'IELTS Academic'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', borderRadius: '999px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5' }}>
                                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065f46' }}>Active</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <button onClick={() => handleTabChange('Add Students')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0.4rem', borderRadius: '0.25rem' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#e0e7ff'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'white' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                            <UserPlus size={28} color="#94a3b8" />
                          </div>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>No Students Enrolled</h4>
                          <p style={{ margin: '0 auto 1.5rem auto', color: '#64748b', fontSize: '0.85rem', maxWidth: '280px', lineHeight: 1.5 }}>Your roster is currently empty. Start by registering your first student.</p>
                          <button onClick={() => handleTabChange('Add Students')} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            <UserPlus size={16} /> Register Student
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions Panel */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#ffffff' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Student Engagement</h3>
                      </div>
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Learners (Weekly)</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>85%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '999px', boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg. Assignment Completion</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>72%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '999px', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Class Attendance</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>92%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: '92%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: '999px', boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}></div>
                          </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                          <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0' }}>Quick Actions</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={() => handleTabChange('Resources')} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                              <BookOpen size={16} color="#6366f1" /> Upload New Content
                            </button>
                            <button onClick={() => handleTabChange('Mock Test')} style={{ width: '100%', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc', color: '#334155', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                              <FileText size={16} color="#10b981" /> Review Mock Tests
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Welcome & Global Stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0 }}>Welcome back, {userName}! 👋</h2>
                      <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Let's crush your IELTS goals today.</p>
                    </div>
                  </div>

                  {/* Primary Action Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                      { title: 'Practice Materials', value: `${practiceQuestionsFiles.length} Available`, color: '#6366f1', bg: '#eef2ff', icon: FileText },
                      { title: 'Listening Audio', value: '45 Tracks', color: '#10b981', bg: '#ecfdf5', icon: Music },
                      { title: 'Speaking Prep', value: 'Live Rooms', color: '#f59e0b', bg: '#fffbeb', icon: Bot },
                      { title: 'Writing Reviews', value: '2 Pending', color: '#ec4899', bg: '#fdf2f8', icon: FileCheck }
                    ].map((card) => {
                      const CardIcon = card.icon;
                      return (
                        <div key={card.title} style={{
                          background: 'white', border: '1px solid #e5e7eb',
                          borderRadius: '1rem', padding: '1.5rem', color: '#111827',
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                          minHeight: '140px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ backgroundColor: card.bg, padding: '0.6rem', borderRadius: '0.5rem' }}>
                              <CardIcon size={24} color={card.color} />
                            </div>
                          </div>
                          <div style={{ marginTop: '1rem' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{card.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{card.value}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Deep Insights and Analytics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    {/* Performance Radar */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Skill Proficiency Breakdown</h3>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {/* Custom Circular Indicators */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                          {[
                            { label: 'Reading', score: '7.5', color: '#3b82f6', width: '80%' },
                            { label: 'Listening', score: '8.0', color: '#10b981', width: '90%' },
                            { label: 'Writing', score: '6.5', color: '#f59e0b', width: '65%' },
                            { label: 'Speaking', score: '7.0', color: '#8b5cf6', width: '75%' }
                          ].map(skill => (
                            <div key={skill.label}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>{skill.label}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: skill.color }}>Band {skill.score}</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: skill.width, height: '100%', backgroundColor: skill.color, borderRadius: '999px' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '1rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Overall Projection</span>
                          <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0' }}>7.5</h2>
                          <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: '#d1fae5', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700 }}>+0.5 Increase</span>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>Action Items</h3>
                        <Clock size={18} color="#9ca3af" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', color: '#ef4444' }}><Clock size={20} /></div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', margin: '0 0 0.25rem 0' }}>Actual Exam Date</h4>
                            <p style={{ fontSize: '0.75rem', color: '#b91c1c', margin: 0 }}>In 14 Days (Sept 24th)</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                          <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', color: '#3b82f6' }}><Play size={20} /></div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a', margin: '0 0 0.25rem 0' }}>Live Grammar Class</h4>
                            <p style={{ fontSize: '0.75rem', color: '#1d4ed8', margin: 0 }}>Starts in 2 hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Library */}
                  <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Recommended Study Modules</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {[
                        { title: 'Advanced Vocabulary', tag: 'High Yield', desc: 'Master Band 8+ lexical resources.', bg: '#fdf4ff', border: '#fae8ff', color: '#c026d3', icon: BookA },
                        { title: 'Complex Structures', tag: 'Grammar', desc: 'Compound and complex sentences.', bg: '#f0fdf4', border: '#dcfce3', color: '#16a34a', icon: BookType },
                        { title: 'Idioms & Phrasal Verbs', tag: 'Speaking', desc: 'Sound like a native speaker naturally.', bg: '#fffbeb', border: '#fef3c7', color: '#d97706', icon: Languages }
                      ].map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <div key={tool.title} style={{ padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: tool.bg, border: `1px solid ${tool.border}`, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <ToolIcon size={20} color={tool.color} />
                              </div>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: tool.color, backgroundColor: 'white', padding: '0.25rem 0.5rem', borderRadius: '999px', border: `1px solid ${tool.border}` }}>
                                {tool.tag}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.35rem' }}>{tool.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div
          onClick={() => setSelectedStudent(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: '1rem',
              padding: '2rem', width: '480px', maxWidth: '90vw',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.4rem' }}>
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>{selectedStudent.name}</h2>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 600 }}>{selectedStudent.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem', lineHeight: 1 }}>✕</button>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Student ID', value: selectedStudent.id || '—' },
                { label: 'Batch', value: selectedStudent.batch || '—' },
                { label: 'Course', value: selectedStudent.course || '—' },
                { label: 'Phone / WhatsApp', value: selectedStudent.phone || '—' },
                { label: 'Email', value: selectedStudent.email || '—' },
                { label: 'Previous IELTS Score', value: selectedStudent.hasPreviousScore === 'yes' ? (selectedStudent.previousScore || '—') : 'No previous score' },
              ].map(item => (
                <div key={item.label} style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem 0' }}>{item.label}</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', margin: 0, wordBreak: 'break-all' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div
          onClick={() => setEditingStudent(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', width: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Edit — {editingStudent.student.name}</h2>
              <button onClick={() => setEditingStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.25rem' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Phone / WhatsApp</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="student@example.com"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingStudent(null)} style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button
                onClick={() => {
                  setStudentsList(prev => {
                    const updated = prev.map((s, i) => i === editingStudent.idx ? { ...s, phone: editPhone, email: editEmail } : s);
                    localStorage.setItem('dev_mock_students', JSON.stringify(updated));
                    return updated;
                  });
                  setEditingStudent(null);
                }}
                style={{ padding: '0.6rem 1.25rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#111827', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {isLogoutModalOpen && (
        <div className="animate-modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(2px)'
        }}>
          <div className="animate-modal-content" style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={20} />
              </button>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Sign Out</h2>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600, marginTop: '0.25rem' }}>Confirm your request to leave</p>
            </div>
            {/* Body */}
            <div style={{ padding: '2rem 1.5rem', backgroundColor: 'white' }}>
              <p style={{ fontSize: '1rem', color: '#374151', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                Are you sure you want to sign out of your account? You will need to log back in to access your dashboard.
              </p>
            </div>
            {/* Footer */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                style={{
                  padding: '0.6rem 1.5rem', borderRadius: '0.5rem', backgroundColor: 'white',
                  border: '1px solid #d1d5db', color: '#374151', fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  padding: '0.6rem 1.5rem', borderRadius: '0.5rem', backgroundColor: '#0f172a',
                  border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
