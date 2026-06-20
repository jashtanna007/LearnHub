import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ courseId, price, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [purchaseType, setPurchaseType] = useState('course_only'); // simple mock for now

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create intent on backend
      const intentRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course_id: courseId,
          purchase_type: purchaseType
        })
      });
      
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error || 'Failed to create payment intent');

      // 2. Confirm payment on frontend with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(intentData.client_secret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) throw new Error(stripeError.message);

      // 3. Notify backend to record payment and enroll
      const confirmRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          course_id: courseId,
          purchase_type: purchaseType
        })
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || 'Failed to confirm payment');

      // Success
      onSuccess(confirmData.enrollment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-[var(--radius-sm)] border border-red-200 dark:border-red-800">{error}</div>}
        
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-[var(--radius-sm)] text-sm text-blue-600 dark:text-blue-400 font-medium flex items-start">
        <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          Testing Mode: Use card <span className="font-mono bg-blue-100 dark:bg-blue-800/50 px-1 py-0.5 rounded">4242 4242 4242 4242</span> with any future date and CVC.
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-md border border-slate-200 dark:border-slate-800">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input 
            type="radio" 
            name="purchase_type" 
            value="course_only"
            checked={purchaseType === 'course_only'}
            onChange={() => setPurchaseType('course_only')}
            className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
          />
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">Course Only</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">₹{price}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Full lifetime access to this course's materials and updates.</p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Credit Card Details
        </label>
        <div className="p-3 border rounded-md bg-white border-gray-300 text-gray-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: document.documentElement.classList.contains('dark') ? '#F1F5F9' : '#111827',
                backgroundColor: 'transparent',
                fontFamily: 'Inter, sans-serif',
                '::placeholder': {
                  color: document.documentElement.classList.contains('dark') ? '#64748B' : '#9CA3AF',
                },
              },
              invalid: { color: '#EF4444' },
            }
          }} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="animate-pulse">Processing...</span>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            Pay ₹{price} & Enroll
          </>
        )}
      </button>
      
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        Cancel
      </button>
    </form>
  );
}

export default function CheckoutModal({ isOpen, onClose, course, onSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-zinc-900/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

        <div className="relative inline-block align-bottom bg-white dark:bg-zinc-950 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white dark:bg-zinc-950 rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                  Complete Enrollment
                </h3>
                
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-50">{course.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Instructor: {course.instructor?.name}</p>
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm courseId={course.id} price={course.price} onSuccess={onSuccess} onCancel={onClose} />
                </Elements>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
