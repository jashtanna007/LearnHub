import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, ChevronRight, ChevronLeft, PlayCircle, CheckCircle, Lock, 
  BookOpen, Bookmark, StickyNote, MessageCircle, ChevronDown, ChevronUp,
  Trash2, Edit, Send, Save, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = import.meta.env.VITE_API_URL;

// ── YouTube → embed ─────────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&\n?]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&autoplay=0` : null;
}

// ── Bookmarks ───────────────────────────────────────────────────────────────
function BookmarksPanel({ lessonId, token }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [label, setLabel] = useState('');
  const fetch_ = useCallback(async () => {
    try { const r = await fetch(`${API}/api/bookmarks/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setBookmarks(await r.json()); } catch(e) { console.error(e); }
  }, [lessonId, token]);
  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Bookmark label..."
          className="flex-1 h-10 px-4 rounded-lg text-sm" style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--border)' }} />
        <button onClick={async () => { await fetch(`${API}/api/bookmarks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ lesson_id: lessonId, timestamp_seconds: 0, label: label || 'Bookmark' }) }); setLabel(''); fetch_(); }}
          className="px-4 h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shrink-0">
          <Bookmark className="w-4 h-4" /> Add
        </button>
      </div>
      {bookmarks.length === 0 ? <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No bookmarks yet.</p> : (
        <div className="space-y-2">{bookmarks.map(b => (
          <div key={b.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>📌 {b.label}</span>
            <button onClick={async () => { await fetch(`${API}/api/bookmarks/${b.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetch_(); }} className="p-1 text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}</div>
      )}
    </div>
  );
}

// ── Notes ────────────────────────────────────────────────────────────────────
function NotesPanel({ lessonId, token }) {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const fetch_ = useCallback(async () => {
    try { const r = await fetch(`${API}/api/notes/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setNotes(await r.json()); } catch(e) { console.error(e); }
  }, [lessonId, token]);
  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your notes here..." rows={3}
        className="w-full p-3 rounded-lg text-sm resize-none" style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--border)' }} />
      <button onClick={async () => { if (!text.trim()) return; await fetch(`${API}/api/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ lesson_id: lessonId, timestamp_seconds: 0, note_text: text }) }); setText(''); fetch_(); }}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Note
      </button>
      {notes.map(n => (
        <div key={n.id} className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {editId === n.id ? (
            <div className="space-y-2">
              <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} className="w-full p-2 rounded-lg text-sm resize-none" style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--border)' }} />
              <div className="flex gap-2">
                <button onClick={async () => { await fetch(`${API}/api/notes/${n.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ note_text: editText }) }); setEditId(null); fetch_(); }} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium">Save</button>
                <button onClick={() => setEditId(null)} className="px-3 py-1 rounded text-xs font-medium" style={{ background: 'var(--secondary)', color: 'var(--text)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{n.note_text}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setEditId(n.id); setEditText(n.note_text); }} className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1"><Edit className="w-3 h-3" />Edit</button>
                <button onClick={async () => { await fetch(`${API}/api/notes/${n.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); fetch_(); }} className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" />Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Q&A ──────────────────────────────────────────────────────────────────────
function QnAPanel({ lessonId, token }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const fetch_ = useCallback(async () => {
    try { const r = await fetch(`${API}/api/comments/${lessonId}`); if (r.ok) setComments(await r.json()); } catch(e) { console.error(e); }
  }, [lessonId]);
  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question..." rows={2}
        className="w-full p-3 rounded-lg text-sm resize-none" style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--border)' }} />
      <button onClick={async () => { if (!text.trim()) return; await fetch(`${API}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ lesson_id: lessonId, text }) }); setText(''); fetch_(); }}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
        <Send className="w-4 h-4" /> Post Question
      </button>
      {comments.map(c => (
        <div key={c.id} className="p-4 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600">{(c.student_name || 'U')[0]}</div>
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{c.student_name || 'Student'}</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text)' }}>{c.text}</p>
          {c.replies?.map(r => (
            <div key={r.id} className="ml-8 mt-3 p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{r.user_name || 'User'}</span>
              <p className="text-sm mt-1" style={{ color: 'var(--text)' }}>{r.text}</p>
            </div>
          ))}
          {replyTo === c.id ? (
            <div className="mt-3 ml-8 flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..."
                className="flex-1 h-9 px-3 rounded-lg text-sm" style={{ background: 'var(--input-bg)', color: 'var(--input-text)', border: '1px solid var(--border)' }} />
              <button onClick={async () => { await fetch(`${API}/api/comments/${c.id}/replies`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ text: replyText }) }); setReplyTo(null); setReplyText(''); fetch_(); }} className="px-3 h-9 bg-indigo-600 text-white rounded-lg text-xs font-medium">Reply</button>
              <button onClick={() => setReplyTo(null)} className="px-3 h-9 rounded-lg text-xs font-medium" style={{ background: 'var(--secondary)', color: 'var(--text)' }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setReplyTo(c.id)} className="text-xs text-indigo-500 hover:text-indigo-600 mt-2 flex items-center gap-1"><MessageCircle className="w-3 h-3" />Reply</button>
          )}
        </div>
      ))}
      {comments.length === 0 && <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No questions yet. Be the first to ask!</p>}
    </div>
  );
}

// ── Quiz Overlay ─────────────────────────────────────────────────────────────
function QuizOverlay({ quiz, token, courseId, onClose, onPass }) {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const r = await fetch(`${API}/api/quizzes/${quiz.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const data = await r.json();
          setQuestions(data.questions || []);
        }
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchQuiz();
  }, [quiz.id, token]);

  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const answersArr = Object.entries(answers).map(([question_id, option_id]) => ({ question_id, option_id }));
      const r = await fetch(`${API}/api/quizzes/${quiz.id}/attempt`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: answersArr })
      });
      if (r.ok) {
        const data = await r.json();
        setResult(data);
      }
    } catch(e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 300;

  if (loading) return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-2xl p-8 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        
        {result ? (
          /* Results screen */
          <div className="text-center py-8">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl font-bold mb-6 ${result.passed ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
              {result.score}%
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{result.passed ? '🎉 Passed!' : '❌ Failed'}</h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Score: {result.score}/100 (Pass: {quiz.min_pass_score || 70}%)</p>
            {result.passed ? (
              <button onClick={() => { onPass?.(); onClose(); }} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">Continue to Next Topic →</button>
            ) : (
              <button onClick={() => { setResult(null); setCurrentQ(0); setAnswers({}); setTimeLeft(20 * 60); }} className="px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">Retry Quiz</button>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{quiz.title}</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Question {currentQ + 1} of {questions.length}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${isUrgent ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'}`}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </div>
            </div>

            {/* Question */}
            {questions[currentQ] && (
              <div>
                <p className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>{questions[currentQ].text}</p>
                <div className="space-y-3">
                  {(questions[currentQ].options || []).map(opt => (
                    <button key={opt.id} onClick={() => setAnswers({ ...answers, [questions[currentQ].id]: opt.id })}
                      className={`w-full p-4 rounded-lg text-left transition-all border ${
                        answers[questions[currentQ].id] === opt.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`} style={answers[questions[currentQ].id] !== opt.id ? { borderColor: 'var(--border)', color: 'var(--text)' } : { color: 'var(--text)' }}>
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30" style={{ color: 'var(--text)', border: '1px solid var(--border)' }}>← Previous</button>
              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)} disabled={!answers[questions[currentQ]?.id]}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-30 hover:bg-indigo-700 transition-colors">Next Question →</button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting || !answers[questions[currentQ]?.id]}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-30 hover:bg-emerald-700 transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>

            <button onClick={onClose} className="mt-4 text-sm w-full text-center" style={{ color: 'var(--text-muted)' }}>Cancel Quiz</button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN LESSON PLAYER
// ═════════════════════════════════════════════════════════════════════════════
export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showQuizBanner, setShowQuizBanner] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [certBanner, setCertBanner] = useState(false);

  // Flatten all lessons for navigation
  const allLessons = [];
  course?.sections?.forEach(sec => {
    sec.topics?.forEach(top => {
      top.lessons?.forEach(les => {
        allLessons.push({ ...les, topicTitle: top.title, sectionTitle: sec.title, topicId: top.id, topicQuiz: top.quizzes?.[0] || null });
      });
    });
  });
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);

  // ── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check enrollment first
        const enrRes = await fetch(`${API}/api/enrollments/my`, { headers: { Authorization: `Bearer ${token}` } });
        if (enrRes.ok) {
          const enrollments = await enrRes.json();
          const isEnrolled = enrollments.some(e => e.course?.id === id);
          if (!isEnrolled) {
            navigate(`/courses/${id}`, { state: { message: 'Please enroll to access this course.' } });
            return;
          }
        }

        // Fetch course
        const cRes = await fetch(`${API}/api/courses/${id}`);
        if (!cRes.ok) { navigate('/courses'); return; }
        const cData = await cRes.json();
        setCourse(cData);

        // Expand first section
        if (cData.sections?.[0]) setExpandedSections({ [cData.sections[0].id]: true });
        // Set first lesson active
        if (cData.sections?.[0]?.topics?.[0]?.lessons?.[0]) setActiveLesson(cData.sections[0].topics[0].lessons[0]);

        // Fetch progress
        const pRes = await fetch(`${API}/api/courses/${id}/progress`, { headers: { Authorization: `Bearer ${token}` } });
        if (pRes.ok) {
          const pData = await pRes.json();
          const ids = (pData.per_lesson_status || []).filter(p => p.status === 'completed').map(p => p.lesson_id);
          const completedSet = new Set(ids);
          setCompletedLessons(completedSet);

          // Auto-select first incomplete lesson
          if (completedSet.size > 0) {
            const flat = [];
            cData.sections?.forEach(sec => sec.topics?.forEach(top => top.lessons?.forEach(les => flat.push({ lesson: les, sectionId: sec.id }))));
            const firstIncomplete = flat.find(f => !completedSet.has(f.lesson.id));
            if (firstIncomplete) {
              setActiveLesson(firstIncomplete.lesson);
              setExpandedSections(prev => ({ ...prev, [firstIncomplete.sectionId]: true }));
            }
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, token, navigate]);

  // ── Mark complete ─────────────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!activeLesson || markingComplete) return;
    setMarkingComplete(true);
    try {
      const res = await fetch(`${API}/api/courses/${id}/progress`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lesson_id: activeLesson.id })
      });
      if (res.ok) {
        const newCompleted = new Set([...completedLessons, activeLesson.id]);
        setCompletedLessons(newCompleted);

        // Check if last lesson of topic — show quiz banner
        const cur = allLessons[currentIndex];
        if (cur) {
          const topicLessons = allLessons.filter(l => l.topicId === cur.topicId);
          const isLastInTopic = topicLessons[topicLessons.length - 1]?.id === activeLesson.id;
          if (isLastInTopic && cur.topicQuiz) {
            setShowQuizBanner(true);
          }
        }

        // Check if ALL lessons complete → certificate
        if (newCompleted.size === allLessons.length && allLessons.length > 0) {
          try {
            await fetch(`${API}/api/certificates/generate/${id}`, {
              method: 'POST', headers: { Authorization: `Bearer ${token}` }
            });
            setCertBanner(true);
            setTimeout(() => setCertBanner(false), 10000);
          } catch(e) { console.error(e); }
        }
      }
    } catch (err) { console.error(err); }
    finally { setMarkingComplete(false); }
  };

  const goToLesson = (index) => {
    if (index >= 0 && index < allLessons.length) {
      setActiveLesson(allLessons[index]);
      setActiveTab('overview');
      setShowQuizBanner(false);
    }
  };

  const toggleSection = (sId) => setExpandedSections(p => ({ ...p, [sId]: !p[sId] }));

  if (loading) return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--text-muted)' }}>Loading course...</p>
      </div>
    </div>
  );

  if (!course) return null;

  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter(l => completedLessons.has(l.id)).length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentComplete = activeLesson ? completedLessons.has(activeLesson.id) : false;
  const embedUrl = activeLesson ? getYouTubeEmbedUrl(activeLesson.video_url) : null;
  const currentMeta = currentIndex >= 0 ? allLessons[currentIndex] : null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="w-[320px] h-full flex-shrink-0 flex flex-col overflow-hidden hidden lg:flex bg-[#0F172A]">
        
        {/* Header */}
        <div className="p-4 flex items-center gap-3 shrink-0 border-b border-slate-700">
          <button onClick={() => navigate(`/courses/${id}`)} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-indigo-400" />
          </button>
          <h2 className="font-bold text-sm line-clamp-2 flex-1 text-white">{course.title}</h2>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 shrink-0 border-b border-slate-700">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span className="text-slate-400">{completedCount} of {totalLessons} complete</span>
            <span className="text-indigo-400 font-bold">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-slate-700">
            <motion.div className="h-full bg-indigo-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* Lesson tree */}
        <div className="flex-1 overflow-y-auto">
          {course.sections?.map(section => (
            <div key={section.id}>
              <button onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors border-b border-slate-700/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{section.title}</span>
                {expandedSections[section.id] ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
              </button>
              <AnimatePresence>
                {expandedSections[section.id] && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    {section.topics?.map(topic => (
                      <div key={topic.id}>
                        <div className="px-4 py-2 pl-6 border-l-[3px] border-indigo-500 ml-3">
                          <span className="text-xs font-semibold text-slate-300">{topic.title}</span>
                        </div>
                        {topic.lessons?.map(lesson => {
                          const isActive = activeLesson?.id === lesson.id;
                          const isDone = completedLessons.has(lesson.id);
                          return (
                            <button key={lesson.id} onClick={() => { setActiveLesson(lesson); setShowQuizBanner(false); }}
                              className={`w-full flex items-center gap-3 px-4 pl-10 py-2.5 text-left text-sm transition-all ${
                                isActive ? 'bg-indigo-600/20 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                              }`}>
                              {isDone ? <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> : <PlayCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />}
                              <span className={`truncate text-[13px] ${isActive ? 'font-semibold' : ''}`}>{lesson.title}</span>
                              {lesson.duration_seconds && <span className="text-[10px] text-slate-600 ml-auto shrink-0">{Math.ceil(lesson.duration_seconds / 60)}m</span>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </aside>

      {/* ── RIGHT CONTENT ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Custom top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => navigate(`/courses/${id}`)} className="p-1"><ArrowLeft className="w-5 h-5" style={{ color: 'var(--text)' }} /></button>
          <span className="text-sm font-bold truncate mx-4" style={{ color: 'var(--text)' }}>{course.title}</span>
          <span className="text-xs font-medium shrink-0 text-indigo-600">{completedCount}/{totalLessons}</span>
        </div>

        {/* Video */}
        <div className="bg-black w-full shrink-0" style={{ aspectRatio: '16/9', maxHeight: '56vh' }}>
          {embedUrl ? (
            <iframe src={embedUrl} title={activeLesson?.title || 'Video'} allowFullScreen className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111827]">
              <div className="text-center p-8">
                <PlayCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{activeLesson?.title || 'Select a lesson'}</h3>
                <p className="text-slate-500 text-sm">Video content will be available soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Lesson info */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{activeLesson?.title || 'No lesson selected'}</h1>
            {currentMeta && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{currentMeta.sectionTitle} → {currentMeta.topicTitle}</p>}
            {activeLesson?.duration_seconds && <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">{Math.ceil(activeLesson.duration_seconds / 60)} min</span>}
          </div>

          {/* Certificate banner */}
          <AnimatePresence>{certBanner && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><Trophy className="w-6 h-6" /><div><p className="font-bold">🎉 Course Complete!</p><p className="text-sm text-white/80">Your certificate has been generated.</p></div></div>
              <button onClick={() => navigate('/student/dashboard')} className="px-4 py-2 bg-white text-amber-600 rounded-lg text-sm font-bold hover:bg-amber-50">View Certificate</button>
            </motion.div>
          )}</AnimatePresence>

          {/* Quiz banner */}
          <AnimatePresence>{showQuizBanner && currentMeta?.topicQuiz && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="text-2xl">🎯</span><div><p className="font-bold">Topic Complete!</p><p className="text-sm text-white/80">Take the quiz to test your knowledge.</p></div></div>
              <button onClick={() => { setActiveQuiz(currentMeta.topicQuiz); setShowQuizBanner(false); }} className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-slate-100">Start Quiz →</button>
            </motion.div>
          )}</AnimatePresence>

          {/* Tab bar */}
          <div className="flex px-6 gap-6" style={{ borderBottom: '1px solid var(--border)' }}>
            {[
              { key: 'overview', label: 'Overview', icon: BookOpen },
              { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
              { key: 'notes', label: 'Notes', icon: StickyNote },
              { key: 'qna', label: 'Q&A', icon: MessageCircle },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent'
                }`} style={activeTab !== tab.key ? { color: 'var(--text-muted)' } : undefined}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>{activeLesson?.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{activeLesson?.description || `Part of "${currentMeta?.topicTitle}" in "${currentMeta?.sectionTitle}".`}</p>
                {activeLesson?.duration_seconds && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Estimated duration: {Math.ceil(activeLesson.duration_seconds / 60)} minutes</p>}
              </div>
            )}
            {activeTab === 'bookmarks' && activeLesson && <BookmarksPanel lessonId={activeLesson.id} token={token} />}
            {activeTab === 'notes' && activeLesson && <NotesPanel lessonId={activeLesson.id} token={token} />}
            {activeTab === 'qna' && activeLesson && <QnAPanel lessonId={activeLesson.id} token={token} />}
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => goToLesson(currentIndex - 1)} disabled={currentIndex <= 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text)', border: '1px solid var(--border)' }}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button onClick={handleMarkComplete} disabled={isCurrentComplete || markingComplete}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
              isCurrentComplete ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25'
            } disabled:cursor-not-allowed`}>
            {isCurrentComplete ? <><CheckCircle className="w-4 h-4" /> Completed</> : markingComplete ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Marking...</> : <><CheckCircle className="w-4 h-4" /> Mark as Complete</>}
          </button>

          <button onClick={() => goToLesson(currentIndex + 1)} disabled={currentIndex >= allLessons.length - 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text)', border: '1px solid var(--border)' }}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quiz Overlay */}
      {activeQuiz && <QuizOverlay quiz={activeQuiz} token={token} courseId={id} onClose={() => setActiveQuiz(null)} onPass={() => {}} />}
    </div>
  );
}
