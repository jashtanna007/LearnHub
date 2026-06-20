import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users } from 'lucide-react';

export default function CourseCard({ course }) {
  const { id, title, thumbnail_url, instructor_name, price, avg_rating, enrolled_count, category } = course;

  return (
    <Link to={`/courses/${id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group">
        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-zinc-900">
          <img 
            src={thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
            {category || 'Course'}
          </div>
        </div>
        
        <div className="flex flex-col flex-grow p-5">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-50 line-clamp-2 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold mr-2">
              {instructor_name?.charAt(0).toUpperCase() || 'I'}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {instructor_name || 'Instructor'}
            </p>
          </div>
          
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center space-x-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{avg_rating > 0 ? avg_rating : 'New'}</span>
              <span className="text-xs text-slate-400">({enrolled_count || 0})</span>
            </div>
            
            <div className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              {price > 0 ? `₹${price}` : 'Free'}
            </div>
          </div>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto shadow-lg">
            Enroll Now
          </div>
        </div>
      </div>
    </Link>
  );
}
