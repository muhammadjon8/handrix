import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api from '../Api';
import { MapPin, Navigation, Clock, CheckCircle, Bell, Wrench, ChevronRight } from 'lucide-react';

interface JobRequest {
  id: number;
  job_type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  // Included directly in dispatch notification
  distance?: number; 
}

export default function HandymanPortal() {
  const [availableJobs, setAvailableJobs] = useState<JobRequest[]>([]);
  const [activeJob, setActiveJob] = useState<JobRequest | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Connect to the Dispatch Gateway
    const socket: Socket = io('http://localhost:3000', {
      auth: { token: `Bearer ${token}` }
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('👷‍♂️ Handyman Portal connected to dispatch network');
    });

    // Core Hook: A job is broadcast to nearby handymen!
    socket.on('new_job_available', (jobData: JobRequest) => {
      console.log('🚨 NEW JOB ALERT:', jobData);
      // Ensure no duplicates if broadcast mulitple times
      setAvailableJobs(prev => {
        if(prev.find(j => j.id === jobData.id)) return prev;
        return [jobData, ...prev];
      });
    });

    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); };
  }, []);

  const handleAcceptJob = async (jobId: number) => {
    setLoading(true);
    try {
       // Fire Task 4.2 constraint locking the job to this Handyman
       const response = await api.post(`/jobs/${jobId}/accept`);
       const fullJobDetails = response.data;
       
       // Move it out of the general ping queue
       setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
       
       // Setup active visual Tracker (Task 4.3 & 4.4)
       setActiveJob(fullJobDetails);
    } catch (error: any) {
       alert(error.response?.data?.message || 'Someone else already accepted this job or it was canceled!');
       setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
    } finally {
       setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!activeJob) return;
    try {
      await api.patch(`/jobs/${activeJob.id}/status`, { status: newStatus });
      setActiveJob({ ...activeJob, status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Network issue updating status sync.');
    }
  };

  if (activeJob) {
    return (
      <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} className="max-w-2xl mx-auto space-y-6">
        <div className="glass-panel p-8">
           <h2 className="text-2xl font-display font-semibold flex items-center gap-3 text-white mb-6">
             <Wrench className="text-primary-accent" /> Active Job Execution
           </h2>
           
           <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3 mb-8">
             <div className="flex gap-3">
               <strong className="text-gray-400 min-w-[70px]">Task:</strong> 
               <span className="text-white capitalize">{activeJob.job_type.replace('_', ' ')}</span>
             </div>
             <div className="flex gap-3">
               <strong className="text-gray-400 min-w-[70px]">Details:</strong> 
               <span className="text-white">{activeJob.description}</span>
             </div>
             <div className="flex gap-3">
               <strong className="text-gray-400 min-w-[70px]">Coords:</strong> 
               <span className="text-primary-accent">{activeJob.latitude}, {activeJob.longitude}</span>
             </div>
           </div>

           <h3 className="text-lg font-medium text-white mb-4">Job Progression</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                disabled={activeJob.status !== 'en_route'}
                onClick={() => handleStatusUpdate('arriving_soon')}
                className={`p-4 rounded-xl text-left border transition-all ${activeJob.status === 'en_route' ? 'border-primary-accent bg-primary-accent/10 hover:bg-primary-accent/20 cursor-pointer' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3 font-semibold text-white">
                  <Navigation size={18} className={activeJob.status === 'en_route' ? 'text-primary-accent' : ''} />
                  Arriving Soon
                </div>
              </button>

              <button 
                disabled={activeJob.status !== 'arriving_soon'}
                onClick={() => handleStatusUpdate('in_progress')}
                className={`p-4 rounded-xl text-left border transition-all ${activeJob.status === 'arriving_soon' ? 'border-primary-accent bg-primary-accent/10 hover:bg-primary-accent/20 cursor-pointer' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-3 font-semibold text-white">
                  <Wrench size={18} className={activeJob.status === 'arriving_soon' ? 'text-primary-accent' : ''} />
                  Start Work
                </div>
              </button>
           </div>

           <button 
             disabled={activeJob.status !== 'in_progress'}
             onClick={() => handleStatusUpdate('completed')}
             className={`w-full mt-4 p-4 rounded-xl text-center border transition-all font-display font-semibold text-lg ${activeJob.status === 'in_progress' ? 'bg-gradient-to-r from-secondary-accent to-primary-accent text-black border-transparent shadow-[0_0_20px_rgba(102,252,241,0.4)] hover:scale-[1.02]' : 'border-white/5 bg-black/20 text-gray-500 cursor-not-allowed'}`}
           >
             ✅ Mark as Completed
           </button>
           
           {activeJob.status === 'completed' && (
             <motion.button 
               initial={{opacity:0}} animate={{opacity:1}}
               onClick={() => setActiveJob(null)}
               className="w-full mt-4 text-sm text-gray-400 hover:text-white"
             >
               Return to Dispatch Scanner
             </motion.button>
           )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-black/30 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${connected ? 'bg-primary-accent text-primary-accent' : 'bg-red-500 text-red-500'}`} />
           <span className="text-white font-medium">{connected ? 'Scanner Online' : 'Connecting to Dispatch...'}</span>
        </div>
        <div className="text-sm text-gray-400">
           {availableJobs.length} local requests
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {availableJobs.length === 0 ? (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-white/20">
               <Bell size={48} className="text-gray-600 mb-4 animate-pulse duration-2000" />
               <h3 className="text-xl text-gray-300 font-display">No active dispatches</h3>
               <p className="text-gray-500 mt-2 text-sm max-w-sm">Keep this screen open. We'll aggressively ping you when a client books a job nearby.</p>
            </motion.div>
          ) : (
            availableJobs.map((job) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel p-6 border border-primary-accent/30 shadow-[0_4px_30px_rgba(102,252,241,0.1)] transition-transform hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 bg-primary-accent/20 text-primary-accent text-xs font-bold px-4 rounded-bl-xl uppercase tracking-wider">
                  New Request
                </div>

                <h3 className="text-xl font-display text-white capitalize mb-2">{job.job_type.replace('_', ' ')}</h3>
                <p className="text-gray-300 mb-4 pr-12">{job.description}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                   <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5">
                     <MapPin size={16} className="text-secondary-accent" />
                     {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}
                   </div>
                   {job.distance && (
                     <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5">
                       <Navigation size={16} className="text-secondary-accent" />
                       ~{job.distance.toFixed(1)} km away
                     </div>
                   )}
                </div>

                <button 
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-secondary-accent to-primary-accent text-black font-semibold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:shadow-[0_0_25px_rgba(102,252,241,0.5)] transition-all disabled:opacity-50"
                >
                  {loading ? 'Securing...' : 'Accept Dispatch'} <ChevronRight size={18} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
