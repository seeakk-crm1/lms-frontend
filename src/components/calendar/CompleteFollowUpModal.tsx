import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { z } from 'zod';
import type { FollowUp } from '../../types/followup.types';

const formSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(2000, 'Description is too long'),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  followUp: FollowUp | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { description: string; images: string[] }) => Promise<void> | void;
}

const CompleteFollowUpModal: React.FC<Props> = ({ isOpen, followUp, isSubmitting, onClose, onSubmit }) => {
  const [images, setImages] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '' },
  });

  const resetModal = useCallback(() => {
    reset({ description: '' });
    setImages([]);
    setUrlDraft('');
    setIsDragActive(false);
    onClose();
  }, [onClose, reset]);

  const addImageUrl = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setImages((current) => (current.includes(trimmed) ? current : [...current, trimmed]));
    setUrlDraft('');
  }, []);

  const helperText = useMemo(
    () => 'Drop image URLs here or paste them manually. Upload integration stays backend-compatible because only URLs are submitted.',
    [],
  );

  return (
    <AnimatePresence>
      {isOpen && followUp ? (
        <div className="fixed inset-0 z-[140] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetModal}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            aria-label="Close complete follow-up modal"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-2xl rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Complete Follow-up</h3>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Mark <span className="font-black text-gray-700">{followUp.type}</span> for lead{' '}
                  <span className="font-black text-gray-700">{followUp.leadId}</span> as completed.
                </p>
              </div>
              <button onClick={resetModal} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(async (values) => {
                await onSubmit({ description: values.description.trim(), images });
                resetModal();
              })}
              className="space-y-5 p-5"
            >
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Description</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Add the follow-up outcome, next context, or visit notes..."
                  className={`mt-1.5 w-full rounded-2xl border bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition-all focus:bg-white ${
                    errors.description ? 'border-red-200' : 'border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
                {errors.description ? <p className="mt-1 text-[11px] font-bold text-red-600">{errors.description.message}</p> : null}
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Image Upload</label>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragActive(false);
                    const droppedUrl = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
                    addImageUrl(droppedUrl);
                  }}
                  className={`mt-1.5 rounded-2xl border border-dashed p-5 transition-all ${
                    isDragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50/60'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-black text-gray-800">Drag & drop image URLs</p>
                    <p className="mt-1 max-w-lg text-xs text-gray-500">{helperText}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={urlDraft}
                    onChange={(event) => setUrlDraft(event.target.value)}
                    placeholder="https://cdn.example.com/follow-up-proof.jpg"
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => addImageUrl(urlDraft)}
                    className="rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white hover:bg-gray-800"
                  >
                    Add URL
                  </button>
                </div>

                {images.length > 0 ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {images.map((image) => (
                      <div key={image} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                        <img src={image} alt="Follow-up preview" className="h-36 w-full object-cover" />
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                          <p className="truncate text-xs font-semibold text-gray-500">{image}</p>
                          <button
                            type="button"
                            onClick={() => setImages((current) => current.filter((entry) => entry !== image))}
                            className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetModal}
                  className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 sm:flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-70 sm:flex-1"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Complete Follow-up
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(CompleteFollowUpModal);
