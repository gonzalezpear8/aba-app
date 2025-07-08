import React, { useState, useEffect } from 'react';
import logo from '../logo.svg';

function AdminDashboard({ user, message, setMessage, logout }) {
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapistUsername, setTherapistUsername] = useState('');
  const [therapistPassword, setTherapistPassword] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientGender, setPatientGender] = useState('female');
  const [assignTherapistId, setAssignTherapistId] = useState('');
  const [assignPatientId, setAssignPatientId] = useState('');
  const [nav, setNav] = useState('home');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const tRes = await fetch('/api/admin/therapists', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const pRes = await fetch('/api/admin/patients', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const tData = await tRes.json();
        const pData = await pRes.json();
        setTherapists(tData.therapists || []);
        setPatients(pData.patients || []);
      } catch (err) {
        setMessage('Error fetching therapists or patients');
      }
    };
    fetchData();
  }, [setMessage]);

  const authHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
  });

  const handleCreateTherapist = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/create-therapist', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ username: therapistUsername, password: therapistPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Therapist created: ' + data.user.username);
        setTherapistUsername('');
        setTherapistPassword('');
        // Refresh therapists list
        const tRes = await fetch('/api/admin/therapists', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const tData = await tRes.json();
        setTherapists(tData.therapists || []);
      } else {
        setMessage(data.error || 'Error creating therapist');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/create-patient', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ name: patientName, dob: patientDob, gender: patientGender })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Patient created: ' + data.patient.name);
        setPatientName('');
        setPatientDob('');
        setPatientGender('female');
        // Refresh patients list
        const pRes = await fetch('/api/admin/patients', {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const pData = await pRes.json();
        setPatients(pData.patients || []);
      } else {
        setMessage(data.error || 'Error creating patient');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleAssignTherapist = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/admin/assign-therapist', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ therapist_id: assignTherapistId, patient_id: assignPatientId })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Therapist assigned to patient!');
        setAssignTherapistId('');
        setAssignPatientId('');
      } else {
        setMessage(data.error || 'Error assigning therapist');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', fontFamily: 'sans-serif' }}>
      {message && <div style={{ color: message.startsWith('Error') ? 'red' : 'green', marginBottom: 16 }}>{message}</div>}
      
      {/* Dashboard Sections */}
      {nav === 'home' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 28, letterSpacing: 1 }}>Welcome, {user?.username || 'Admin'}!</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40 }}>
            <button
              style={{
                padding: '20px 36px',
                background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 20,
                boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                transition: 'transform 0.1s',
                cursor: 'pointer',
              }}
              onClick={() => setNav('patients')}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              + New Patient
            </button>
            <button
              style={{
                padding: '20px 36px',
                background: 'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 20,
                boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                transition: 'transform 0.1s',
                cursor: 'pointer',
              }}
              onClick={() => setNav('therapists')}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              + Add New Therapist
            </button>
            <button
              style={{
                padding: '20px 36px',
                background: 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 20,
                boxShadow: '0 2px 8px rgba(251,191,36,0.10)',
                transition: 'transform 0.1s',
                cursor: 'pointer',
              }}
              onClick={() => setNav('assignments')}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Assignments
            </button>
          </div>
        </div>
      )}
      
      {nav === 'patients' && (
        <div>
          <button className="btn" onClick={() => setNav('home')} style={{ background: '#fff', color: '#6366f1', border: '2px solid #6366f1', fontWeight: 700, fontSize: 16, borderRadius: 8, marginBottom: 16 }}>← Back</button>
          <h2 style={{ marginBottom: 24 }}>Patients</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40, alignItems: 'center' }}>
            {patients.map(p => {
              const dob = new Date(p.dob);
              const dobStr = !isNaN(dob) ? dob.toLocaleDateString('en-US') : p.dob;
              return (
                <div key={p.id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
                  padding: '18px 32px',
                  minWidth: 320,
                  maxWidth: 480,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  border: '1.5px solid #e0e7ff',
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#22223b',
                  transition: 'box-shadow 0.2s, border 0.2s',
                  cursor: 'pointer',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.13)';
                  e.currentTarget.style.border = '1.5px solid #6366f1';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.08)';
                  e.currentTarget.style.border = '1.5px solid #e0e7ff';
                }}
                >
                  <span style={{ fontWeight: 700, color: '#6366f1', minWidth: 40 }}>#{p.id}</span>
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span style={{ color: '#6b7280', fontSize: 16 }}>DOB: {dobStr}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(99,102,241,0.10)', padding: '32px 32px 24px 32px', minWidth: 340, maxWidth: 480, width: '100%', border: '1.5px solid #e0e7ff', marginBottom: 24 }}>
              <img src={logo} alt="Logo" style={{ width: 48, height: 48, marginBottom: 8 }} />
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20, color: '#6366f1', letterSpacing: 1 }}>Create Patient</h3>
              <form onSubmit={handleCreatePatient} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 16,
                    minWidth: 120,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={patientDob}
                  onChange={e => setPatientDob(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 16,
                    minWidth: 120,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                />
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 16,
                    minWidth: 100,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s, background 0.2s',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
                >
                  Create Patient
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {nav === 'therapists' && (
        <div>
          <button className="btn" onClick={() => setNav('home')} style={{ background: '#fff', color: '#6366f1', border: '2px solid #6366f1', fontWeight: 700, fontSize: 16, borderRadius: 8, marginBottom: 16 }}>← Back</button>
          <h2 style={{ marginBottom: 24 }}>Therapists</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40, alignItems: 'center' }}>
            {therapists.map(t => (
              <div key={t.id} style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
                padding: '18px 32px',
                minWidth: 320,
                maxWidth: 480,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                border: '1.5px solid #e0e7ff',
                fontSize: 18,
                fontWeight: 500,
                color: '#22223b',
                transition: 'box-shadow 0.2s, border 0.2s',
                cursor: 'pointer',
              }}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.13)';
                e.currentTarget.style.border = '1.5px solid #10b981';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.08)';
                e.currentTarget.style.border = '1.5px solid #e0e7ff';
              }}
              >
                <span style={{ fontWeight: 700, color: '#10b981', minWidth: 40 }}>#{t.id}</span>
                <span style={{ flex: 1 }}>{t.username}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(16,185,129,0.10)', padding: '32px 32px 24px 32px', minWidth: 340, maxWidth: 480, width: '100%', border: '1.5px solid #d1fae5', marginBottom: 24 }}>
              <img src={logo} alt="Logo" style={{ width: 48, height: 48, marginBottom: 8 }} />
              <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20, color: '#10b981', letterSpacing: 1 }}>Create Therapist</h3>
              <form onSubmit={handleCreateTherapist} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="text"
                  placeholder="Therapist Username"
                  value={therapistUsername}
                  onChange={e => setTherapistUsername(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #a7f3d0',
                    fontSize: 16,
                    minWidth: 120,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                />
                <input
                  type="password"
                  placeholder="Therapist Password"
                  value={therapistPassword}
                  onChange={e => setTherapistPassword(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #a7f3d0',
                    fontSize: 16,
                    minWidth: 120,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s, background 0.2s',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #059669 0%, #34d399 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #10b981 0%, #6ee7b7 100%)'}
                >
                  Create Therapist
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {nav === 'assignments' && (
        <div>
          <button className="btn" onClick={() => setNav('home')} style={{ background: '#fff', color: '#6366f1', border: '2px solid #6366f1', fontWeight: 700, fontSize: 16, borderRadius: 8, marginBottom: 16 }}>← Back</button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(99,102,241,0.10)', padding: '32px 32px 24px 32px', minWidth: 340, maxWidth: 480, width: '100%', border: '1.5px solid #e0e7ff', marginBottom: 24 }}>
              <img src={logo} alt="Logo" style={{ width: 48, height: 48, marginBottom: 8 }} />
              <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20, color: '#6366f1', letterSpacing: 1 }}>Assign Therapist to Patient</h2>
              <form onSubmit={handleAssignTherapist} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <select
                  value={assignTherapistId}
                  onChange={e => setAssignTherapistId(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 16,
                    minWidth: 140,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Select Therapist</option>
                  {therapists.map(t => (
                    <option key={t.id} value={t.id}>{t.username} (ID: {t.id})</option>
                  ))}
                </select>
                <select
                  value={assignPatientId}
                  onChange={e => setAssignPatientId(e.target.value)}
                  required
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid #c7d2fe',
                    fontSize: 16,
                    minWidth: 140,
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                </select>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 18,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s, background 0.2s',
                  }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)'}
                >
                  Assign
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 