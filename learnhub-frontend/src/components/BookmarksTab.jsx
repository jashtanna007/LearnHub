import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BookmarksTab({ lessonId, playerRef }) {
  const { token } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [label, setLabel] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, [lessonId]);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookmarks/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks', err);
    }
  };

  const addBookmark = async (e) => {
    e.preventDefault();
    if (!playerRef?.current) return;
    
    const timestamp_seconds = Math.floor(playerRef.current.currentTime || 0);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lesson_id: lessonId, timestamp_seconds, label })
      });
      if (res.ok) {
        setLabel('');
        fetchBookmarks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBookmark = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookmarks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBookmarks();
    } catch (err) {
      console.error(err);
    }
  };

  const seekTo = (seconds) => {
    if (playerRef?.current) {
      playerRef.current.currentTime = seconds;
      playerRef.current.play();
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6">
      <form onSubmit={addBookmark} className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Add a bookmark at current time..." 
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
          Save Bookmark
        </button>
      </form>

      <div className="space-y-3">
        {bookmarks.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No bookmarks yet. Add one to save important moments.</p>
        ) : (
          bookmarks.map(bm => (
            <div key={bm.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-md">
              <div className="flex items-center gap-4 cursor-pointer hover:text-indigo-600" onClick={() => seekTo(bm.timestamp_seconds)}>
                <span className="font-mono text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded">
                  {formatTime(bm.timestamp_seconds)}
                </span>
                <span className="text-zinc-900 dark:text-zinc-50 font-medium">{bm.label || 'Bookmark'}</span>
              </div>
              <button onClick={() => deleteBookmark(bm.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
