import React, { useState } from 'react';
import UploadSection from './UploadSection';
import ProgressTracker from './ProgressTracker';
import ImportHistory from './ImportHistory';

export default function LeadImportPage() {
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
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-64px)] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Bulk Lead Import</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <UploadSection onUploadStart={handleUploadStart} isUploading={!!activeJobId} />
          {activeJobId && (
            <ProgressTracker jobId={activeJobId} onClear={clearJob} />
          )}
        </div>
        
        <div className="h-full">
          <ImportHistory />
        </div>
      </div>
    </div>
  );
}
