import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotesTab({ lessonId, playerRef }) {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [lessonId]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    const timestamp_seconds = playerRef?.current ? Math.floor(playerRef.current.currentTime || 0) : 0;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lesson_id: lessonId, timestamp_seconds, note_text: newNote })
      });
      if (res.ok) {
        setNewNote('');
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateNote = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note_text: editText })
      });
      if (res.ok) {
        setEditingId(null);
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6">
      <form onSubmit={addNote} className="mb-8">
        <textarea 
          placeholder="Take a note..." 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 mb-3 min-h-[100px]"
        />
        <div className="flex justify-between items-center text-sm text-slate-500">
          <span>Notes are private to you.</span>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
            Save Note
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-slate-500 text-center py-8">You haven't taken any notes for this lesson yet.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              {editingId === note.id ? (
                <div>
                  <textarea 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
                    <button onClick={() => updateNote(note.id)} className="px-3 py-1 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded cursor-pointer" onClick={() => {
                      if(playerRef?.current) {
                        playerRef.current.currentTime = note.timestamp_seconds;
                        playerRef.current.play();
                      }
                    }}>
                      @ {formatTime(note.timestamp_seconds)}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(note.id); setEditText(note.note_text); }} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{note.note_text}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
