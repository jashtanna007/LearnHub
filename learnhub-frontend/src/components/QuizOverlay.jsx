import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Clock, X, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

export default function QuizOverlay({ topic, onClose, onPass }) {
  const { token } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  // In a real app, we fetch the quiz data
  // For demo, we assume topic.quizzes[0] has questions, or we mock it
  const quiz = topic.quizzes?.[0] || {
    title: `Quiz: ${topic.title}`,
    questions: [
      { id: 1, text: "What is the primary concept discussed in this topic?", options: ["Concept A", "Concept B", "Concept C", "Concept D"], correct_answer: "Concept A" },
      { id: 2, text: "Which of the following is NOT a benefit?", options: ["Benefit X", "Benefit Y", "Benefit Z", "Drawback Q"], correct_answer: "Drawback Q" },
    ],
    passing_score: 80
  };

  useEffect(() => {
    if (quizFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizFinished]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNext = () => {
    setAnswers({ ...answers, [currentQuestionIndex]: selectedOption });
    setSelectedOption(null);
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    
    // Calculate Score locally for demo
    let correct = 0;
    const finalAnswers = { ...answers, [currentQuestionIndex]: selectedOption };
    
    quiz.questions.forEach((q, idx) => {
      if (finalAnswers[idx] === q.correct_answer) correct++;
    });
    
    const calculatedScore = Math.round((correct / quiz.questions.length) * 100);
    setScore(calculatedScore);

    // Call backend to submit attempt
    if (quiz.id) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/${quiz.id}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ score: calculatedScore })
        });
      } catch (err) {
        console.error('Failed to submit quiz attempt:', err);
      }
    }
  };

  const currentQ = quiz.questions[currentQuestionIndex];
  const passed = score >= (quiz.passing_score || 80);
  const isTimeCritical = timeLeft < 300 && !quizFinished; // Less than 5 mins

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950 text-white overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10 p-4 lg:p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-lg">{quiz.title}</h2>
            {!quizFinished && (
              <p className="text-sm text-slate-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
            )}
          </div>
        </div>
        
        {!quizFinished && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${isTimeCritical ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-300'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20">
        <AnimatePresence mode="wait">
          {!quizFinished ? (
            <motion.div 
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-8">
                {currentQ.text}
              </h3>
              
              <div className="space-y-4">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${
                        isSelected 
                          ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(79,70,229,0.2)]' 
                          : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg font-medium">{option}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary' : 'border-slate-700 group-hover:border-slate-500'
                      }`}>
                        {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all active:scale-95 flex items-center"
                >
                  {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden"
            >
              {passed && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />}
              {!passed && <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600" />}

              <div className="flex justify-center mb-8">
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                    <circle 
                      cx="96" cy="96" r="88" 
                      stroke="currentColor" 
                      strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray="552.92" 
                      strokeDashoffset={552.92 - (552.92 * score) / 100}
                      className={passed ? 'text-emerald-500' : 'text-red-500'} 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-5xl font-black">{score}%</span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-4">
                {passed ? 'Congratulations! 🎉' : 'Needs more practice'}
              </h3>
              <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto">
                {passed 
                  ? "You've successfully passed the quiz and unlocked the next topic. Keep up the great work!" 
                  : `You need an ${quiz.passing_score || 80}% to pass. Review the material and try again.`}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {passed ? (
                  <button onClick={onPass} className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center">
                    Continue to Next Topic <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <>
                    <button onClick={onClose} className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center">
                      Review Lesson <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                    <button onClick={() => {
                      setQuizFinished(false);
                      setCurrentQuestionIndex(0);
                      setSelectedOption(null);
                      setAnswers({});
                      setTimeLeft(600);
                      setScore(0);
                    }} className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 mr-2" /> Retake Quiz
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
