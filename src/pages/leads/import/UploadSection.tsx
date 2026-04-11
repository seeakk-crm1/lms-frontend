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
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
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
    <div className="bg-white border rounded-xl shadow-sm p-6 relative overflow-hidden">
      {isUploading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <p className="font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            Import currently in progress
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Upload Leads</h3>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-3">
          {file ? (
            <div className="flex flex-col items-center text-green-600">
               <FileType className="w-10 h-10 mb-2" />
               <p className="font-medium">{file.name}</p>
               <p className="text-xs text-green-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="text-blue-500 font-semibold">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">CSV or Excel (max. 10MB)</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <a
          href="/templates/lead_template.csv"
          download="lead_template.csv"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:shadow-md"
        >
          <DownloadCloud className="w-4 h-4" />
          Download Template
        </a>
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all text-white
            ${(!file || loading) ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`
          }
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Starting...
            </>
          ) : (
             <>
               <UploadCloud className="w-4 h-4" />
               Start Upload
             </>
          )}
        </button>
      </div>
    </div>
  );
}
