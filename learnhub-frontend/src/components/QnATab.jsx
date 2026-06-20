import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Reply } from 'lucide-react';

export default function QnATab({ lessonId }) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lesson_id: lessonId, text: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const postReply = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: replyText })
      });
      if (res.ok) {
        setReplyText('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={postComment} className="mb-8">
        <textarea 
          placeholder="Ask a question..." 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 mb-3 min-h-[100px]"
        />
        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200">
            Post Question
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
              {c.student_name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{c.student_name}</span>
                  <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.text}</p>
                <div className="mt-3">
                  <button 
                    onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(''); }}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <Reply className="w-4 h-4" /> Reply
                  </button>
                </div>
              </div>

              {/* Replies */}
              {c.replies && c.replies.length > 0 && (
                <div className="mt-4 pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800 ml-4">
                  {c.replies.map(r => (
                    <div key={r.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {r.student_name.charAt(0)}
                      </div>
                      <div className="flex-1 bg-white dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">{r.student_name}</span>
                          <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === c.id && (
                <div className="mt-4 pl-10 flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button onClick={() => postReply(c.id)} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
