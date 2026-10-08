import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove `const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);`
content = re.sub(r'  const \[isAddStudentModalOpen, setIsAddStudentModalOpen\] = useState\(false\);\n', '', content)

# 2. Insert the activeTab === 'Add Students' view
add_student_view = r'''          ) : activeTab === 'Add Students' && userRole === 'trainer' ? (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={24} /> Add New Student
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>Create a new student profile and authentication credentials.</p>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                maxWidth: '600px'
              }}>
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
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Login Email</label>
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
          ) : (
            /* ===== DASHBOARD VIEW ===== */'''

content = content.replace(r'''          ) : (
            /* ===== DASHBOARD VIEW ===== */''', add_student_view)

# 3. Remove the modal block completely
content = re.sub(r'      \{isAddStudentModalOpen && \([\s\S]*?      \}\)\n\n', '', content)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Dashboard views updated.')
