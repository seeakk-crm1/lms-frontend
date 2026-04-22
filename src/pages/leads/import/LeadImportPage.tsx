import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import UploadSection from './UploadSection';
import ProgressTracker from './ProgressTracker';
import ImportHistory from './ImportHistory';

export default function LeadImportPage() {
  const navigate = useNavigate();
  const [activeJobId, setActiveJobId] = useState<string | null>(localStorage.getItem("jobId") || null);

  const handleUploadStart = (jobId: string) => {
    localStorage.setItem("jobId", jobId);
    setActiveJobId(jobId);
  };

  const clearJob = () => {
    localStorage.removeItem("jobId");
    setActiveJobId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bulk Lead Import</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">Upload CSV files to import multiple leads at once.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div className="flex flex-col gap-6">
          <UploadSection onUploadStart={handleUploadStart} isUploading={!!activeJobId} />
          {activeJobId && (
            <ProgressTracker jobId={activeJobId} onClear={clearJob} />
          )}
        </div>
        
        <div className="h-full">
          <ImportHistory />
        </div>
      </motion.div>
    </div>
  );
}
