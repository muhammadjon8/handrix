import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Wrench, CheckCircle, Clock } from 'lucide-react';
import api from '../Api';

interface JobHistoryProps {
  role: 'client' | 'handyman';
}

export default function JobHistory({ role }: JobHistoryProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const endpoint = role === 'client' ? '/jobs' : '/jobs/handyman';
        const res = await api.get(endpoint);
        setJobs(res.data);
      } catch (err) {
        console.error('Failed to fetch jobs history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [role]);

  // Aggregate earnings safely only for completed jobs assigned to this handyman
  const totalEarnings = role === 'handyman' 
    ? jobs.filter(j => j.status === 'completed').reduce((acc, j) => acc + Number(j.laborCost || 0), 0)
    : 0;

  if (loading) return <div className="text-gray-500 flex justify-center py-10">Loading history...</div>;

  return (
    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="max-w-4xl mx-auto space-y-6">
      
      {/* Earnings Dashboard / Header Banner */}
      <div className="glass-panel p-6 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <History className="text-primary-accent" size={24} />
           <h2 className="text-2xl font-display font-semibold text-white capitalize">
             {role === 'handyman' ? 'Earnings & History' : 'Service History'}
           </h2>
         </div>
         
         {role === 'handyman' && (
           <div className="text-right">
             <p className="text-sm text-gray-400 uppercase tracking-widest">Total Earnings</p>
             <p className="text-3xl font-bold text-primary-accent">${totalEarnings.toFixed(2)}</p>
           </div>
         )}
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="glass-panel p-10 text-center text-gray-400">
             No past jobs found. Build your reputation and check back here!
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="glass-panel p-6 flex flex-col md:flex-row gap-6 justify-between transition-all hover:bg-white/[0.02]">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <span className="font-display font-bold capitalize text-lg text-white">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold ${
                      job.status === 'completed' ? 'bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/50' : 
                      job.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 
                      'bg-primary-accent/20 text-primary-accent border border-primary-accent/50'
                    }`}>
                      {job.status}
                    </span>
                    
                    {job.warranty && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <CheckCircle size={12}/> Active Warranty: {new Date(job.warranty.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                 </div>
                 <p className="text-gray-300 text-sm max-w-xl line-clamp-2">{job.description}</p>
                 <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                   <span className="flex items-center gap-1"><Clock size={14}/> {new Date(job.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><Wrench size={14}/> {job.estimatedDurationHours} hours</span>
                 </div>
               </div>

               <div className="flex flex-col justify-center items-end text-right min-w-[120px]">
                 <p className="text-sm text-gray-400 mb-1">
                   {role === 'handyman' ? 'Payout' : 'Paid'}
                 </p>
                 <p className="text-xl font-display font-bold text-white">
                   ${role === 'handyman' ? Number(job.laborCost || 0).toFixed(2) : Number(job.totalPrice || 0).toFixed(2)}
                 </p>
                 {job.status === 'completed' && <CheckCircle size={16} className="text-secondary-accent mt-2" />}
               </div>
            </div>
          ))
        )}
      </div>

    </motion.div>
  );
}
