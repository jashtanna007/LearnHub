import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900 mt-auto">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1280px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="bg-primary text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                LearnHub
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Empowering learners worldwide with high-quality, accessible education in technology and design.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/courses" className="hover:text-primary transition-colors">Browse Catalog</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Career Tracks</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">For Enterprise</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Resources</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Community Forum</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Become an Instructor</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium">© {new Date().getFullYear()} LearnHub Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium">
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
            <Link to="#" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
