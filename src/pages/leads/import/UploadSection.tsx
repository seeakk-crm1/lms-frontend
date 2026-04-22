import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadLeadFile } from './import.service';
import { DownloadCloud, UploadCloud, FileType } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadSectionProps {
  onUploadStart: (jobId: string) => void;
  isUploading: boolean;
}

export default function UploadSection({ onUploadStart, isUploading }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const res = await uploadLeadFile(file);
      if (res.success && res.data.job_id) {
        toast.success("Upload started successfully!");
        onUploadStart(res.data.job_id);
        setFile(null);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm relative overflow-hidden">
      {isUploading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex items-center justify-center rounded-3xl">
          <p className="font-bold text-gray-900 bg-white px-6 py-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Import currently in progress...
          </p>
        </div>
      )}

      <div className="mb-6 flex items-center gap-2">
        <UploadCloud className="h-5 w-5 text-emerald-500" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Upload Data</h3>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' 
            : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          {file ? (
            <div className="flex flex-col items-center">
               <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                 <FileType className="w-8 h-8 text-emerald-600" />
               </div>
               <p className="text-base font-black text-gray-900">{file.name}</p>
               <p className="mt-1 text-sm font-semibold text-emerald-600">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-1 transition-transform group-hover:scale-110">
                <UploadCloud className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-base text-gray-600 font-semibold mt-2">
                <span className="text-emerald-500 font-black">Click to select</span> or drag and drop here
              </div>
              <p className="text-sm font-medium text-gray-400 mt-1">Accepts CSV files only (max 10MB)</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <a
            href="/templates/lead_template.csv"
            download="lead_template.csv"
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          >
            <DownloadCloud className="w-4 h-4" />
            Download CSV Template
          </a>
          <a
            href="/templates/lead_template.numbers"
            download="lead_template.numbers"
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all text-sky-700 bg-sky-50 hover:bg-sky-100"
          >
            <DownloadCloud className="w-4 h-4" />
            Download Numbers Template
          </a>
        </div>
        <p className="text-xs font-semibold text-gray-500">
          If you use the Numbers template, export it as CSV before uploading.
        </p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-end items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all
            ${(!file || loading) 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30'}`
          }
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Starting...
            </>
          ) : (
             <>
               <UploadCloud className="w-4 h-4" />
               Start Import Process
             </>
          )}
        </button>
      </div>
    </div>
  );
}
