import React, { useState, useEffect } from 'react';
import GoalRunner from './GoalRunner';

function SessionRunnerModal({ patient, goals, onClose, onSessionComplete, setMessage }) {
  const [step, setStep] = useState('select'); // select, run, summary
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState([]); // {goalId, correct}
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // For GoalRunner UI
  const [goalImages, setGoalImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [goalFeedback, setGoalFeedback] = useState('');
  const [fetchingImages, setFetchingImages] = useState(false);

  // Step 1: Select goals
  const handleGoalToggle = (goalId) => {
    setSelectedGoals(prev => prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]);
  };

  const startSession = () => {
    if (selectedGoals.length === 0) {
      setMessage('Select at least one goal.');
      return;
    }
    setStep('run');
    setCurrentIdx(0);
    setResults([]);
  };

  // Fetch images for the current goal when running
  useEffect(() => {
    if (step === 'run' && selectedGoals.length > 0 && currentIdx < selectedGoals.length) {
      const fetchImages = async () => {
        setFetchingImages(true);
        setGoalImages([]);
        setSelectedImageId(null);
        setGoalFeedback('');
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/therapist/goal/${selectedGoals[currentIdx]}/images`, {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          const data = await res.json();
          if (res.ok) {
            setGoalImages(data.images || []);
          } else {
            setGoalImages([]);
            setMessage(data.error || 'Error loading goal images');
          }
        } catch (err) {
          setGoalImages([]);
          setMessage('Network error');
        } finally {
          setFetchingImages(false);
        }
      };
      fetchImages();
    }
  }, [step, selectedGoals, currentIdx, setMessage]);

  // Step 2: Run goals with GoalRunner UI
  const handleSelectImage = (img) => {
    setSelectedImageId(img.id);
    const isCorrect = img.is_correct;
    setGoalFeedback(isCorrect ? 'Correct! 🎉' : 'Incorrect. Try again!');
    setTimeout(() => {
      setGoalFeedback('');
      setSelectedImageId(null);
      setResults(prev => [...prev, { goalId: selectedGoals[currentIdx], correct: isCorrect }]);
      if (currentIdx + 1 < selectedGoals.length) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setStep('summary');
      }
    }, 1200);
  };

  // Step 3: Submit session
  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      // 1. Create session
      const res = await fetch('/api/therapist/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ patient_id: patient.id, goal_ids: selectedGoals })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create session');
      const sessionId = data.session_id;
      // 2. Record results
      const res2 = await fetch(`/api/therapist/session/${sessionId}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ results })
      });
      if (!res2.ok) throw new Error('Failed to record results');
      // 3. Add note
      if (note.trim()) {
        const res3 = await fetch(`/api/therapist/session/${sessionId}/note`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({ note })
        });
        if (!res3.ok) throw new Error('Failed to save note');
      }
      setMessage('Session saved!');
      onSessionComplete();
      onClose();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <div className="modal" style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:8, padding:32, minWidth:350, maxWidth:600, minHeight:300 }}>
        <button className="btn" onClick={onClose} style={{ float:'right' }}>X</button>
        <h2>Run Session for {patient.name}</h2>
        {step === 'select' && (
          <>
            <div style={{ marginBottom:8 }}>Select goals to run:</div>
            <ul style={{ listStyle:'none', padding:0, marginBottom:16 }}>
              {goals.map(g => (
                <li key={g.id}>
                  <label>
                    <input type="checkbox" checked={selectedGoals.includes(g.id)} onChange={() => handleGoalToggle(g.id)} />
                    {g.name}
                  </label>
                </li>
              ))}
            </ul>
            <button className="btn" onClick={startSession} disabled={selectedGoals.length === 0}>Start Session</button>
          </>
        )}
        {step === 'run' && selectedGoals.length > 0 && currentIdx < selectedGoals.length && !fetchingImages && (
          <GoalRunner
            goal={goals.find(g=>g.id===selectedGoals[currentIdx])}
            images={goalImages}
            selectedImageId={selectedImageId}
            feedback={goalFeedback}
            onSelectImage={handleSelectImage}
            onExit={onClose}
          />
        )}
        {step === 'run' && fetchingImages && (
          <div>Loading images...</div>
        )}
        {step === 'summary' && (
          <>
            <div style={{ marginBottom:8 }}>Session Summary:</div>
            <ul style={{ listStyle:'none', padding:0, marginBottom:8 }}>
              {results.map((r,i) => (
                <li key={i}>{goals.find(g=>g.id===r.goalId)?.name}: <b>{r.correct ? 'Correct' : 'Incorrect'}</b></li>
              ))}
            </ul>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add session note (optional)" style={{ width:'100%', minHeight:60, marginBottom:8 }} />
            <button className="btn" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save Session'}</button>
          </>
        )}
      </div>
    </div>
  );
}

export default SessionRunnerModal; 