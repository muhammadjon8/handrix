import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CreditCard, Wrench, CheckCircle, MapPin } from 'lucide-react';
import api from '../Api';

interface JobConfirmationProps {
  jobData: any;
  onBookingComplete: (jobResponse: any) => void;
  onCancel: () => void;
}

export default function JobConfirmation({ jobData, onBookingComplete, onCancel }: JobConfirmationProps) {
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Example base pricing (Ideally this could also come directly from backend Pricing Logic if desired)
  const HOURLY_RATE = 45;
  const TRANSPORT_FEE = 15;
  const estimatedLabor = (jobData.estimated_duration_hours || 1) * HOURLY_RATE;
  const partsCost = (jobData.materials || []).reduce((acc: number, m: any) => acc + (m.estimated_cost || 0), 0);
  const totalAmount = estimatedLabor + partsCost + TRANSPORT_FEE;

  const handleConfirm = async () => {
    setBooking(true);
    setError('');

    try {
      const response = await api.post('/jobs', {
        job_type: jobData.job_type,
        description: jobData.description,
        latitude: jobData.location.lat,
        longitude: jobData.location.lng,
        estimated_duration_hours: jobData.estimated_duration_hours || 1,
        labor_cost: estimatedLabor,
        transport_fee: TRANSPORT_FEE,
        parts: jobData.materials?.map((m: any) => ({
          name: m.name || 'Unknown part',
          quantity: m.quantity || 1,
          unit_cost: m.estimated_cost || 0
        })) || []
      });

      onBookingComplete(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to book the job. Are you logged in as a Client?');
    } finally {
      setBooking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto glass-panel p-8 font-body"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-accent/20 text-primary-accent flex items-center justify-center mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-3xl font-display font-semibold text-white">Job Scope Finalized</h2>
        <p className="text-gray-400 mt-2">Please review the AI's assessment before dispatching.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 mb-6 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Scope Details */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
          <Wrench className="text-secondary-accent shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium capitalize text-lg">{jobData.job_type.replace('_', ' ')}</h4>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{jobData.description}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
          <MapPin className="text-secondary-accent shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium text-lg">Location</h4>
            <p className="text-gray-400 text-sm mt-1">{jobData.location.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-white/5">
          <Clock className="text-secondary-accent shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-medium text-lg">Estimated Duration</h4>
            <p className="text-gray-400 text-sm mt-1">{jobData.estimated_duration_hours} Hour(s)</p>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-black/50 p-6 rounded-xl border border-white/10 mb-8">
        <h4 className="flex items-center gap-2 text-lg font-medium text-white border-b border-white/10 pb-3 mb-3">
          <CreditCard size={18} className="text-primary-accent" /> Estimated Quote
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Labor ({jobData.estimated_duration_hours}h @ ${HOURLY_RATE}/h)</span>
            <span>${estimatedLabor.toFixed(2)}</span>
          </div>
          {jobData.materials?.map((m: any, idx: number) => (
            <div key={idx} className="flex justify-between text-gray-300">
              <span>Part: {m.name}</span>
              <span>${(m.estimated_cost || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between text-gray-300">
            <span>Transport/Dispatch Fee</span>
            <span>${TRANSPORT_FEE.toFixed(2)}</span>
          </div>
          
          <div className="pt-3 mt-3 border-t border-white/10 flex justify-between text-white font-display text-xl font-bold">
            <span>Total Estimate</span>
            <span className="text-primary-accent">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button 
          onClick={onCancel}
          disabled={booking}
          className="flex-1 py-3 px-4 rounded-full border border-white/20 text-white hover:bg-white/5 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          disabled={booking}
          className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-secondary-accent to-primary-accent text-black font-semibold shadow-lg hover:shadow-primary-accent/50 transition-all font-display hover:-translate-y-1"
        >
          {booking ? 'Dispatching...' : 'Book Handyman'}
        </button>
      </div>
    </motion.div>
  );
}
