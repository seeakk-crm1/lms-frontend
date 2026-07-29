import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadLeadFile, validateLeadFile, ValidationReport } from './import.service';
import { DownloadCloud, UploadCloud, FileType, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadSectionProps {
  onUploadStart: (payload: { jobId: string; fileName: string }) => void;
  importState: 'idle' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  importSummary?: {
    success: number;
    failed: number;
  } | null;
}

export default function UploadSection({ onUploadStart, importState, importSummary }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections && fileRejections.length > 0) {
      toast.error('Unsupported file format.\n\nPlease upload a CSV or Excel (.xlsx) file.');
      return;
    }
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      const ext = selected.name.toLowerCase().slice(selected.name.lastIndexOf('.'));
      if (ext !== '.csv' && ext !== '.xlsx') {
        toast.error('Unsupported file format.\n\nPlease upload a CSV or Excel (.xlsx) file.');
        return;
      }
      setFile(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const handleStartValidation = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const res = await validateLeadFile(file);
      if (res.success && res.data) {
        setValidationReport(res.data);
        setValidationModalOpen(true);
      } else {
        await executeUpload();
      }
    } catch (err: any) {
      console.error('Pre-validation failed, proceeding to direct import', err);
      toast.error(err.response?.data?.message || 'Unable to read the Excel file. Please verify the workbook format and try again.');
      await executeUpload();
    } finally {
      setLoading(false);
    }
  };

  const executeUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const res = await uploadLeadFile(file);
      if (res.success && res.data.job_id) {
        toast.success('Upload started successfully!');
        onUploadStart({ jobId: res.data.job_id, fileName: file.name });
        setFile(null);
        setValidationModalOpen(false);
        setValidationReport(null);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelValidation = () => {
    setValidationModalOpen(false);
    setValidationReport(null);
    setFile(null);
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm relative overflow-hidden">
      {importState === 'processing' && (
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

      {importState !== 'idle' && importState !== 'processing' && (
        <div
          className={`mb-6 rounded-2xl border px-5 py-4 ${
            importState === 'completed'
              ? 'border-emerald-200 bg-emerald-50'
              : importState === 'completed_with_errors'
                ? 'border-amber-200 bg-amber-50'
                : 'border-rose-200 bg-rose-50'
          }`}
        >
          <div className="flex items-start gap-3">
            {importState === 'completed' && <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />}
            {importState === 'completed_with_errors' && <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />}
            {importState === 'failed' && <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />}
            <div>
              <p
                className={`text-sm font-black uppercase tracking-[0.18em] ${
                  importState === 'completed'
                    ? 'text-emerald-800'
                    : importState === 'completed_with_errors'
                      ? 'text-amber-800'
                      : 'text-rose-800'
                }`}
              >
                {importState === 'completed' && 'Import Completed Successfully'}
                {importState === 'completed_with_errors' && 'Import Completed With Errors'}
                {importState === 'failed' && 'Import Failed'}
              </p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  importState === 'completed'
                    ? 'text-emerald-700'
                    : importState === 'completed_with_errors'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                }`}
              >
                {importState === 'completed' && `${importSummary?.success ?? 0} leads imported successfully.`}
                {importState === 'completed_with_errors' && `${importSummary?.success ?? 0} imported, ${importSummary?.failed ?? 0} failed.`}
                {importState === 'failed' && `${importSummary?.failed ?? 0} records failed during import.`}
              </p>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-sm font-medium text-gray-400 mt-1">Accepts CSV or Excel (.xlsx) files (max 10 MB)</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <a
            href="/templates/lead_template.csv"
            download="lead_template.csv"
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
          >
            <DownloadCloud className="w-4 h-4" />
            Download CSV Template
          </a>
          <a
            href="/templates/lead_template.xlsx"
            download="lead_template.xlsx"
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all text-teal-700 bg-teal-50 hover:bg-teal-100"
          >
            <DownloadCloud className="w-4 h-4" />
            Download Excel Template
          </a>
          <a
            href="/templates/lead_template.numbers"
            download="lead_template.numbers"
            className="flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all text-sky-700 bg-sky-50 hover:bg-sky-100"
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
          onClick={handleStartValidation}
          disabled={!file || loading}
          className={`flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all ${
            !file || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-1 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Validating File...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              {importState === 'completed' || importState === 'completed_with_errors' || importState === 'failed'
                ? 'Start Another Import'
                : 'Start Import Process'}
            </>
          )}
        </button>
      </div>

      {/* Pre-Import Validation Summary Modal */}
      {validationModalOpen && validationReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Pre-Import Validation Report
              </h3>
              <button
                onClick={handleCancelValidation}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-gray-50 p-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase">Rows Found</p>
                  <p className="mt-1 text-xl font-black text-gray-900">{validationReport.rowsFound}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Ready To Import</p>
                  <p className="mt-1 text-xl font-black text-emerald-800">{validationReport.readyToImport}</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 uppercase">Rows With Issues</p>
                  <p className="mt-1 text-xl font-black text-amber-800">{validationReport.rowsWithIssues}</p>
                </div>
              </div>

              {validationReport.fieldIssuesSummary.length > 0 ? (
                <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2">Fields With Issues</p>
                  <ul className="space-y-1 text-sm font-semibold text-amber-800">
                    {validationReport.fieldIssuesSummary.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>• {item.field}</span>
                        <span className="font-bold">({item.count} rows)</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs font-medium text-amber-700">
                    Note: Rows with invalid optional fields will be imported with skipped field warnings.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm font-bold text-emerald-800">All fields in all rows passed validation cleanly!</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <button
                onClick={handleCancelValidation}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel Import
              </button>
              <button
                onClick={executeUpload}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-black shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Starting Import...'
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Import Valid Data Only
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
