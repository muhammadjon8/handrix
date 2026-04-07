import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Navigation, CheckCircle2, Loader2, Wrench } from 'lucide-react';

interface ActiveJobTrackerProps {
  jobId: number;
  initialStatus?: string;
  jobType?: string;
}

const statusSteps = [
  { key: 'dispatching', label: 'Finding a Handyman' },
  { key: 'en_route', label: 'Handyman En Route' },
  { key: 'arriving_soon', label: 'Arriving Soon' },
  { key: 'in_progress', label: 'Work In Progress' },
  { key: 'completed', label: 'Job Completed' }
];

export default function ActiveJobTracker({ jobId, initialStatus = 'dispatching', jobType }: ActiveJobTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [handymanProfile, setHandymanProfile] = useState<any>(null);

  useEffect(() => {
    // Retrieve Auth token for Secure WebSockets Connection
    const token = localStorage.getItem('token');
    
    const socket: Socket = io('http://localhost:3000', {
      auth: { token: `Bearer ${token}` } // Send JWT down the socket pipe!
    });

    socket.on('connect', () => {
      console.log('✅ Connect to Real-time Dispatch Server');
    });

    // Listen strictly for the specific status update broadcasted by the NestJS Gateway
    socket.on('job_status_update', (data) => {
      console.log('🔔 live job update received:', data);
      if (data.jobId === jobId) {
        setCurrentStatus(data.status);
        if (data.handymanId && !handymanProfile) {
          // If the backend sent a new assignment ID over the websocket, theoretically 
          // we could update state here or trigger a fetch for their profile data.
          setHandymanProfile({ id: data.handymanId });
        }
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
    };
  }, [jobId]);

  // Derive the active index in the progress bar
  const currentStepIndex = statusSteps.findIndex(s => s.key === currentStatus);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto glass-panel p-8 font-body"
    >
      <div className="flex flex-col items-center text-center pb-8 border-b border-white/10">
        <div className="w-16 h-16 rounded-full bg-primary-accent/10 border border-primary-accent/30 text-primary-accent flex items-center justify-center mb-4 relative overflow-hidden">
          {currentStatus === 'completed' ? (
             <CheckCircle2 size={32} />
          ) : (
             <>
               <Navigation size={28} className={currentStatus === 'dispatching' ? 'animate-pulse' : 'animate-bounce'} />
               {currentStatus === 'dispatching' && (
                 <div className="absolute inset-0 bg-primary-accent/20 animate-ping rounded-full" />
               )}
             </>
          )}
        </div>
        <h2 className="text-2xl font-display font-semibold text-white">
          Active Job Request
        </h2>
        <p className="text-gray-400 mt-1 uppercase tracking-widest text-sm flex items-center gap-2 justify-center">
           <Wrench size={14}/> 
           {jobType ? jobType.replace('_', ' ') : `JOB #${jobId}`}
        </p>
      </div>

      <div className="pt-8">
        <h3 className="text-lg text-white mb-6 font-display font-medium">Live Status</h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:-z-10 before:bg-white/10">
          {statusSteps.map((step, idx) => {
            const isActive = step.key === currentStatus;
            const isPast = idx < currentStepIndex;
            
            let bulletColor = 'bg-gray-800 border-white/10 text-gray-500';
            if (isPast) bulletColor = 'bg-secondary-accent border-secondary-accent text-white shadow-[0_0_15px_rgba(69,162,158,0.5)]';
            if (isActive) bulletColor = 'bg-primary-accent border-primary-accent text-black shadow-[0_0_20px_rgba(102,252,241,0.7)] transform scale-110';

            return (
              <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-opacity ${!isPast && !isActive ? 'opacity-40' : 'opacity-100'}`}>
                {/* Icon wrapper styling specifically aligned onto the vertical tracer line */}
                <div className={`p-[1px] absolute flex items-center justify-center w-8 h-8 rounded-full border-2 ${bulletColor} md:left-1/2 md:-ml-4`}>
                    {isActive && currentStatus !== 'completed' ? <Loader2 size={14} className="animate-spin" /> : 
                     isPast || currentStatus === 'completed' ? <CheckCircle2 size={14} /> : 
                     <div className="w-2 h-2 rounded-full bg-current" />}
                </div>

                {/* Text Block container styling staggered on left/right for Desktop, stacked on Mobile */}
                <div className="ml-12 md:ml-0 md:w-[calc(50%-2.5rem)] md:odd:text-right">
                  <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all ${isActive ? 'bg-primary-accent/10 border-primary-accent/30' : 'bg-black/40 border-white/5'}`}>
                    <h4 className={`font-semibold ${isActive ? 'text-primary-accent' : isPast ? 'text-white' : 'text-gray-400'}`}>
                      {step.label}
                    </h4>
                    {isActive && idx === 0 && (
                      <p className="text-xs text-gray-400 mt-2">Geospatial dispatch active. Searching radius...</p>
                    )}
                    {isActive && idx === 1 && handymanProfile && (
                      <p className="text-xs text-primary-accent mt-2">Handyman assigned! Headed your way.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
