import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/courses`);
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(c.category);
    const matchesRating = (c.avg_rating || 0) >= minRating;
    return matchesSearch && matchesCategory && matchesRating;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortBy === 'rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    return b.id - a.id; // newest fallback
  });

  return (
    <div className="bg-background min-h-screen">
      
      {/* Header */}
      <div className="bg-secondary/30 border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-[1280px]">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Explore Courses</h1>
          <p className="text-muted-foreground text-lg">Find the perfect course to advance your skills. {courses.length} courses available.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1280px] py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
            </Button>
            <span className="text-sm text-muted-foreground">{sortedCourses.length} results</span>
          </div>

          {/* Sidebar */}
          <AnimatePresence>
            {(mobileFiltersOpen || window.innerWidth >= 1024) && (
              <motion.aside 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:w-64 shrink-0 overflow-hidden lg:overflow-visible"
              >
                <div className="bg-card border border-border rounded-[var(--radius-md)] p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-foreground flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-primary" /> Filters
                    </h2>
                    {(selectedCategories.length > 0 || minRating > 0) && (
                      <button 
                        onClick={() => { setSelectedCategories([]); setMinRating(0); }}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-foreground mb-4">Category</h3>
                    <div className="space-y-3">
                      {categories.map(cat => (
                        <label key={cat} className="flex items-center group cursor-pointer">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${
                            selectedCategories.includes(cat) ? 'bg-primary border-primary text-white' : 'border-input bg-background group-hover:border-primary'
                          }`}>
                            {selectedCategories.includes(cat) && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryToggle(cat)} />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Rating</h3>
                    <div className="space-y-3">
                      {[4, 3].map(rating => (
                        <label key={rating} className="flex items-center group cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            className="hidden" 
                            checked={minRating === rating} 
                            onChange={() => setMinRating(rating)} 
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors ${
                            minRating === rating ? 'border-indigo-600 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-indigo-400'
                          }`}>
                            {minRating === rating && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                          </div>
                          <div className="flex items-center text-amber-500">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-muted'}`} />)}
                            <span className="ml-2 text-sm text-muted-foreground group-hover:text-foreground">& up</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                <div className="relative w-full sm:w-48">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-12 appearance-none bg-background border border-input rounded-[var(--radius-sm)] pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="newest">Newest</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[180px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                ))
              ) : sortedCourses.length > 0 ? (
                sortedCourses.map((course, i) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link to={`/courses/${course.id}`} className="group block h-full">
                      <div className="bg-card rounded-[var(--radius-md)] border border-border overflow-hidden card-hover h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <img 
                            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {course.category || 'Course'}
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            by {course.instructor?.name || 'Instructor'}
                          </p>
                          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex items-center text-amber-500">
                              <Star className="w-4 h-4 fill-current mr-1" />
                              <span className="font-bold text-foreground">{course.avg_rating > 0 ? course.avg_rating : 'New'}</span>
                              <span className="text-muted-foreground text-xs ml-1">({course.enrolled_count || 0} students)</span>
                            </div>
                            <div className="font-bold text-lg text-foreground">
                              ₹{course.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-card rounded-[var(--radius-md)] border border-border">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-bold text-foreground mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or search term.</p>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategories([]); setMinRating(0); }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
