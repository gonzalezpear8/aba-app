import React, { useState, useEffect } from 'react';

function AdminDashboard({ user, message, setMessage }) {
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapistUsername, setTherapistUsername] = useState('');
  const [therapistPassword, setTherapistPassword] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientDob, setPatientDob] = useState('');
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
        body: JSON.stringify({ name: patientName, dob: patientDob })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Patient created: ' + data.patient.name);
        setPatientName('');
        setPatientDob('');
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
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 8 }}>
          {'<Logo>'} ABA App {'<Name>'}
        </div>
        {/* Navigation */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <button onClick={() => setNav('home')}>Home</button>
          <button onClick={() => setNav('patients')}>Patients</button>
          <button onClick={() => setNav('therapists')}>Therapists</button>
          <button onClick={() => setNav('assignments')}>Assignments</button>
        </div>
      </div>
      {message && <div style={{ color: message.startsWith('Error') ? 'red' : 'green', marginBottom: 16 }}>{message}</div>}
      
      {/* Dashboard Sections */}
      {nav === 'home' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Welcome, Admin!</div>
          <div>Quick Actions:</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 24 }}>
            <button style={{ padding: 16 }} onClick={() => setNav('patients')}>+ New Patient</button>
            <button style={{ padding: 16 }} onClick={() => setNav('therapists')}>+ Add New Therapist</button>
            <button style={{ padding: 16 }} onClick={() => setNav('assignments')}>View Assignments</button>
          </div>
        </div>
      )}
      
      {nav === 'patients' && (
        <div>
          <h2>Patients</h2>
          <ul>
            {patients.map(p => (
              <li key={p.id}>ID: {p.id} | {p.name} | DOB: {p.dob}</li>
            ))}
          </ul>
          <h3>Create Patient</h3>
          <form onSubmit={handleCreatePatient}>
            <input
              type="text"
              placeholder="Patient Name"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={patientDob}
              onChange={e => setPatientDob(e.target.value)}
              required
            />
            <button type="submit">Create Patient</button>
          </form>
        </div>
      )}
      
      {nav === 'therapists' && (
        <div>
          <h2>Therapists</h2>
          <ul>
            {therapists.map(t => (
              <li key={t.id}>ID: {t.id} | {t.username}</li>
            ))}
          </ul>
          <h3>Create Therapist</h3>
          <form onSubmit={handleCreateTherapist}>
            <input
              type="text"
              placeholder="Therapist Username"
              value={therapistUsername}
              onChange={e => setTherapistUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Therapist Password"
              value={therapistPassword}
              onChange={e => setTherapistPassword(e.target.value)}
              required
            />
            <button type="submit">Create Therapist</button>
          </form>
        </div>
      )}
      
      {nav === 'assignments' && (
        <div>
          <h2>Assign Therapist to Patient</h2>
          <form onSubmit={handleAssignTherapist}>
            <select
              value={assignTherapistId}
              onChange={e => setAssignTherapistId(e.target.value)}
              required
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
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
              ))}
            </select>
            <button type="submit">Assign</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 