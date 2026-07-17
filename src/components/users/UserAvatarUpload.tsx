import React, { useRef, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useFormContext, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface UserAvatarUploadProps {
  name: string;
}

const UserAvatarUpload: React.FC<UserAvatarUploadProps> = ({ name }) => {
  const { control, setValue, watch } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const currentImageUrl = watch(name);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);

      let fileToUpload = file;
      if (file.size > 1024 * 1024) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          initialQuality: 0.8,
        };
        fileToUpload = await imageCompression(file, options);
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success && response.data?.url) {
        setValue(name, response.data.url, { shouldValidate: true, shouldDirty: true });
        toast.success('Profile picture uploaded successfully.');
      } else {
        throw new Error('Invalid response from upload API');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setValue(name, '', { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider w-full text-left">Profile Picture</h3>
      <div className="flex items-center gap-6 w-full">
        <div className="relative h-20 w-20 shrink-0 rounded-full border-4 border-white bg-gray-50 shadow-md overflow-hidden group">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-emerald-600 bg-emerald-50">
              <Camera className="h-7 w-7 opacity-50" />
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {currentImageUrl ? 'Change Picture' : 'Upload Picture'}
            </button>
            {currentImageUrl && (
              <button
                type="button"
                disabled={isUploading}
                onClick={handleRemove}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors disabled:opacity-50 shrink-0"
                title="Remove picture"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium">
            JPG, PNG or WEBP. Max 1MB (auto-compressed).
          </p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/jpg, image/png, image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => <input type="hidden" {...field} value={field.value || ''} />}
      />
    </div>
  );
};

export default UserAvatarUpload;
