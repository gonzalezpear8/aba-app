import React, { useEffect, useState } from 'react';

function SessionHistory({ patient, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/therapist/patient/${patient.id}/sessions`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch sessions');
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [patient.id]);

  return (
    <div className="modal" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:8, padding:32, minWidth:350, maxWidth:500, maxHeight:'80vh', overflowY:'auto' }}>
        <button className="btn" onClick={onClose} style={{ float:'right' }}>X</button>
        <h2>Session History for {patient.name}</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color:'red' }}>{error}</div>}
        {!loading && !error && (
          <>
            {sessions.length === 0 && <div>No sessions found.</div>}
            <ul style={{ listStyle:'none', padding:0 }}>
              {sessions.map(s => (
                <li key={s.id} style={{ border:'1px solid #ccc', borderRadius:6, marginBottom:12, padding:12 }}>
                  <div><b>{s.name}</b> <span style={{ color:'#888' }}>({new Date(s.created_at).toLocaleString()})</span></div>
                  <div>Goals:</div>
                  <ul style={{ marginLeft:16 }}>
                    {s.results.map((r,i) => (
                      <li key={i}>{r.goal_name}: <b>{r.outcome ? 'Correct' : 'Incorrect'}</b></li>
                    ))}
                  </ul>
                  {s.note && <div style={{ marginTop:6, fontStyle:'italic', color:'#555' }}>Note: {s.note}</div>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default SessionHistory; 