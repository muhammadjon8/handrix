import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import api from '../Api';
import { MapPin, Navigation, Wrench, ChevronRight, Bell, ExternalLink, CheckCircle } from 'lucide-react';

interface JobRequest {
  id: number;
  job_type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  distance?: number; 
}

export default function HandymanPortal() {
  const [availableJobs, setAvailableJobs] = useState<JobRequest[]>([]);
  const [activeJob, setActiveJob] = useState<JobRequest | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    fetchProfile();
    
    const token = localStorage.getItem('token');
    const socket: Socket = io('http://localhost:3000', {
      auth: { token: `Bearer ${token}` }
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('👷‍♂️ Handyman Portal connected');
    });

    socket.on('new_job_available', (jobData: JobRequest) => {
      setAvailableJobs(prev => {
        if(prev.find(j => j.id === jobData.id)) return prev;
        return [jobData, ...prev];
      });
    });

    socket.on('disconnect', () => setConnected(false));
    return () => { socket.disconnect(); };
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/handymen/profile');
      setIsOnline(res.data.availability === 'available');
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  const toggleOnline = async () => {
    setLoading(true);
    const nextStatus = isOnline ? 'offline' : 'available';
    try {
      if (nextStatus === 'available') {
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        await api.patch('/handymen/location', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        const dispatchingJobs = await api.get(`/jobs/dispatching?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`);
        setAvailableJobs(dispatchingJobs.data);
      }

      await api.patch('/handymen/availability', { availability: nextStatus });
      setIsOnline(!isOnline);
    } catch (error) {
      alert('Location required to go online! Please check permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId: number) => {
    setLoading(true);
    try {
       const response = await api.post(`/jobs/${jobId}/accept`);
       const fullJobDetails = response.data;
       setAvailableJobs(prev => prev.filter(j => j.id !== jobId));
       setActiveJob(fullJobDetails);
    } catch (error: any) {
       alert(error.response?.data?.message || 'Someone else already accepted this job!');
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
      alert('Network issue updating status sync.');
    }
  };

  if (activeJob) {
    const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${activeJob.latitude},${activeJob.longitude}`;

    return (
      <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-8 h-fit">
             <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-3 text-white">
                  <Wrench className="text-primary-accent" /> Active Dispatch
                </h2>
                <div className="px-3 py-1 rounded-full bg-primary-accent/10 border border-primary-accent/30 text-primary-accent text-[10px] font-bold uppercase tracking-wider">
                  #{activeJob.id}
                </div>
             </div>
             
             <div className="space-y-6 mb-8 text-sm">
               <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Task Description</label>
                 <span className="text-white capitalize font-medium block text-lg mb-1">{activeJob.job_type.replace('_', ' ')}</span>
                 <p className="text-gray-400 font-light leading-relaxed">{activeJob.description}</p>
               </div>

               <div className="flex gap-4">
                 <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/5">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Status</label>
                   <span className="text-primary-accent font-black uppercase tracking-tighter text-base">
                     {activeJob.status.replace('_', ' ')}
                   </span>
                 </div>
                 <a 
                   href={googleMapsWebUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="flex items-center justify-center p-4 bg-primary-accent/10 hover:bg-primary-accent/20 rounded-xl border border-primary-accent/20 text-primary-accent transition-all group"
                 >
                   <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                 </a>
               </div>
             </div>

             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Command Center</h3>
             <div className="grid grid-cols-1 gap-3">
                {activeJob.status === 'en_route' && (
                  <button 
                    onClick={() => handleStatusUpdate('on_site')}
                    className="w-full p-4 rounded-xl font-display font-bold text-lg bg-primary-accent text-black shadow-[0_0_15px_rgba(102,252,241,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    🚩 I HAVE ARRIVED
                  </button>
                )}

                {activeJob.status === 'on_site' && (
                  <button 
                    onClick={() => handleStatusUpdate('completed')}
                    className="w-full p-4 rounded-xl font-display font-bold text-lg bg-gradient-to-r from-secondary-accent to-primary-accent text-black shadow-[0_0_20px_rgba(102,252,241,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  >
                    ✅ COMPLETE SERVICE
                  </button>
                )}

                {activeJob.status === 'completed' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 font-bold flex items-center justify-center gap-2">
                       <CheckCircle size={18} /> Service Finalized
                    </p>
                    <button onClick={() => setActiveJob(null)} className="text-xs text-gray-500 mt-2 hover:underline">Exit to Main Console</button>
                  </motion.div>
                )}
             </div>
          </div>

          <div className="glass-panel overflow-hidden border-none relative group min-h-[400px]">
             <div className="absolute inset-0 bg-[#0b0c10] flex items-center justify-center">
                <div className="z-10 text-center p-8 backdrop-blur-xl bg-black/40 rounded-3xl border border-white/10 shadow-2xl">
                   <div className="w-16 h-16 bg-primary-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-accent/20">
                      <MapPin size={32} className="text-primary-accent animate-bounce" />
                   </div>
                   <h4 className="text-white font-display text-xl mb-2">Destination Locked</h4>
                   <p className="text-gray-400 text-sm mb-6 max-w-[200px] mx-auto italic">Tap view for high-precision navigation instructions.</p>
                   <a 
                     href={googleMapsWebUrl}
                     target="_blank"
                     rel="noreferrer"
                     className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 transition-all block"
                   >
                     Launch Google Maps
                   </a>
                </div>
                <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#1f2833_0%,_#0b0c10_100%)]" />
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
                     {[...Array(64)].map((_, i) => <div key={i} className="border border-white/20" />)}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-black/30 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isOnline ? 'bg-primary-accent/10' : 'bg-red-500/10'}`}>
               <Bell size={24} className={isOnline ? 'text-primary-accent' : 'text-red-500'} />
            </div>
            <div>
              <h2 className="text-xl font-display font-semibold text-white">Dispatch Status</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                {connected ? 'Real-time sync active' : 'Network disconnected'}
              </div>
            </div>
          </div>
          
          <button 
            onClick={toggleOnline}
            disabled={loading}
            className={`px-8 py-3 rounded-full font-display font-bold transition-all shadow-lg ${
              isOnline 
              ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white uppercase tracking-wider text-xs' 
              : 'bg-primary-accent text-black hover:scale-105 shadow-primary-accent/20'
            }`}
          >
            {loading ? 'Processing...' : isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {!isOnline ? (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="glass-panel p-16 text-center flex flex-col items-center justify-center border-dashed border-white/10">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                 <MapPin size={40} className="text-gray-600" />
               </div>
               <h3 className="text-2xl text-white font-display mb-2">Scanner Suspended</h3>
               <p className="text-gray-500 text-sm max-w-sm mb-8">You are currently hidden from the dispatch network. Go online to start receiving work near your current location.</p>
               <button onClick={toggleOnline} className="text-primary-accent font-semibold hover:underline">Activate Scanner Now</button>
            </motion.div>
          ) : availableJobs.length === 0 ? (
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="glass-panel p-16 text-center flex flex-col items-center justify-center border-dashed border-white/20">
               <div className="relative mb-6">
                 <div className="absolute inset-0 bg-primary-accent/20 rounded-full animate-ping scale-150 duration-2000" />
                 <div className="relative w-20 h-20 bg-primary-accent/10 rounded-full flex items-center justify-center">
                   <Bell size={40} className="text-primary-accent animate-pulse" />
                 </div>
               </div>
               <h3 className="text-2xl text-white font-display mb-2">Scanning for requests...</h3>
               <p className="text-gray-500 text-sm max-w-sm">We are analyzing your local area for new minor repair tasks. Keep this screen open.</p>
            </motion.div>
          ) : (
            availableJobs.map((job) => (
              <motion.div 
                key={job.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel p-6 border border-primary-accent/30 shadow-[0_10px_40px_rgba(102,252,241,0.1)] transition-all hover:border-primary-accent relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary-accent/10 text-primary-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em]">
                    New Dispatch
                  </div>
                  <div className="text-xs text-gray-500">Job #{job.id}</div>
                </div>

                <h3 className="text-2xl font-display text-white capitalize mb-2">{job.job_type.replace('_', ' ')}</h3>
                <p className="text-gray-300 mb-6 font-light leading-relaxed">{job.description}</p>
                
                <div className="flex flex-wrap gap-3 mb-8">
                   <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                     <MapPin size={14} className="text-secondary-accent" />
                     {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)}
                   </div>
                   {job.distance && (
                     <div className="flex items-center gap-2 text-xs text-secondary-accent bg-secondary-accent/5 px-4 py-2 rounded-full border border-secondary-accent/20">
                       <Navigation size={14} />
                       ~{job.distance.toFixed(1)} km from you
                     </div>
                   )}
                </div>

                <button 
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-secondary-accent to-primary-accent text-black font-display font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(102,252,241,0.2)] hover:shadow-[0_15px_30px_rgba(102,252,241,0.4)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 uppercase"
                >
                  {loading ? 'Locking Job...' : 'Accept & Navigate'} <ChevronRight size={20} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
