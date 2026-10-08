import re

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = r'''  const handleCreateStudent = async () => {
    if (!newStudentId || !newStudentPassword) {
      alert("Student ID and Password are required!");
      return;
    }

    setIsCreatingStudent(true);
    const finalEmail = newStudentEmail || (newStudentId.includes('@') ? newStudentId : `${newStudentId}@student.vectragroup.com`);

    try {
      const response = await fetch('/api/admin/add-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          password: newStudentPassword,
          full_name: newStudentFullName || newStudentId,
          phone: newStudentPhone,
          student_id: newStudentId,
          has_previous_score: hasPreviousScore,
          previous_score: newStudentScore,
          batch: 'Batch 1',
          course: 'IELTS Academic',
          status: 'Active'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(`Error: ${data.error}`);
        return;
      }
      
      const newStudent = {
        id: data.user.id,
        name: newStudentFullName || newStudentId,
        student_id: newStudentId,
        phone: newStudentPhone,
        email: finalEmail,
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

      setNewStudentFullName('');
      setNewStudentPhone('');
      setNewStudentId('');
      setNewStudentPassword('');
      setNewStudentEmail('');
      setNewStudentScore('');
      setHasPreviousScore('no');
      
      alert('Student created successfully!');
      handleTabChange('Dashboard');
    } catch (e: any) {
      alert(`Error creating student: ${e.message}`);
    } finally {
      setIsCreatingStudent(false);
    }
  };'''

new_content = re.sub(
    r'  const handleCreateStudent = async \(\) => \{.*?\} finally \{\n      setIsCreatingStudent\(false\);\n    \}\n  \};',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Updated handleCreateStudent')
