import React, { useState, useRef } from 'react';
import { DEFAULT_AVATAR, PLACEHOLDER_AVATAR, FAMILY_MEMBERS } from '../data/mockData';
import { playReminderChime, speakText } from '../utils/audio';

interface CustomDPModalProps {
  currentPhotoUrl: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (newPhotoUrl: string) => void;
}

export const PRESET_AVATARS = [
  { id: 'av-default', url: DEFAULT_AVATAR, label: 'Gentleman with Glasses (Default)' },
  { id: 'av-placeholder', url: PLACEHOLDER_AVATAR, label: 'Senior with Friendly Smile' },
  { id: 'av-grandma', url: FAMILY_MEMBERS[0].image, label: 'Graceful Senior Woman' },
  { id: 'av-elder-man', url: FAMILY_MEMBERS[4].image, label: 'Traditional Elder' },
  { id: 'av-family-maya', url: FAMILY_MEMBERS[2].image, label: 'Cheerful Portrait' },
];

/**
 * Resizes and center-crops an uploaded image onto an HTML5 Canvas,
 * producing a lightweight, high-clarity JPEG data URL (< 60 KB)
 * that fits cleanly into localStorage without quota limits.
 */
export const resizeImageToSquareDataUrl = (file: File, targetSize = 320): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPEG, PNG, WebP, etc.).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not parse image data. Please try another photo.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas rendering context unavailable.'));
          return;
        }

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const CustomDPModal: React.FC<CustomDPModalProps> = ({
  currentPhotoUrl,
  patientName,
  isOpen,
  onClose,
  onSavePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process File from drag & drop or file input
  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');
    try {
      const optimizedDataUrl = await resizeImageToSquareDataUrl(file, 320);
      setPreviewUrl(optimizedDataUrl);
      setSuccessNotice('Custom photo loaded & optimized! Click "Save as Profile Picture" to apply.');
      playReminderChime();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please paste a valid web image URL.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessNotice('');

    const img = new Image();
    img.onload = () => {
      setPreviewUrl(trimmed);
      setIsLoading(false);
      setSuccessNotice('Web photo loaded! Click "Save as Profile Picture" to apply.');
      playReminderChime();
    };
    img.onerror = () => {
      setIsLoading(false);
      setErrorMessage('Unable to load image from this URL. Please check the link or upload a local file.');
    };
    img.src = trimmed;
  };

  const handleSave = () => {
    onSavePhoto(previewUrl);
    speakText(`Profile display picture updated for ${patientName}.`);
    onClose();
  };

  const handleResetToDefault = () => {
    setPreviewUrl(DEFAULT_AVATAR);
    setSuccessNotice('Reset to default portrait. Click "Save as Profile Picture" to apply.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        id="custom-dp-modal-card"
        className="bg-white dark:bg-[#1e2023] w-full max-w-lg rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#e1e2e5] dark:border-[#282a2d] flex items-center justify-between bg-[#f8f9fc] dark:bg-[#181a1c]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#003c53] dark:bg-[#94cef0] text-white dark:text-[#001e2c] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[22px]">account_box</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#003c53] dark:text-[#94cef0]">
                Custom Profile Picture (DP)
              </h3>
              <p className="text-xs text-[#71787e] dark:text-[#9aa2a9]">
                Personalize {patientName}'s display photo across MindSpark
              </p>
            </div>
          </div>
          <button
            id="close-dp-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#71787e] hover:bg-[#edeef0] dark:hover:bg-[#282a2d] transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Preview Area */}
          <div className="flex flex-col items-center justify-center gap-3 py-2 bg-[#f2f4f8] dark:bg-[#282a2d]/50 rounded-2xl border border-[#c0c7ce]/30 p-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-neu-extruded ring-4 ring-white dark:ring-[#282a2d] bg-gray-200">
                <img
                  src={previewUrl}
                  alt={`${patientName} preview`}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-1 right-1 bg-[#003c53] text-white p-1.5 rounded-full shadow-md text-xs flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px]">verified</span>
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-[#003c53] dark:text-[#94cef0] uppercase tracking-wider block">
                Live Circular Preview
              </span>
              <p className="text-xs text-[#71787e] dark:text-[#9aa2a9]">
                Appears in Top Header, Emergency Cards, and Caregiver Portal
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex bg-[#edeef0] dark:bg-[#282a2d] p-1 rounded-xl">
            <button
              id="dp-tab-upload"
              type="button"
              onClick={() => {
                setActiveTab('upload');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Upload File</span>
            </button>

            <button
              id="dp-tab-presets"
              type="button"
              onClick={() => {
                setActiveTab('presets');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">face</span>
              <span>Avatar Presets</span>
            </button>

            <button
              id="dp-tab-url"
              type="button"
              onClick={() => {
                setActiveTab('url');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-[#1e2023] text-[#003c53] dark:text-[#94cef0] shadow-sm'
                  : 'text-[#71787e] hover:text-[#191c1e] dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
              <span>Photo Link</span>
            </button>
          </div>

          {/* TAB 1: Upload via Drag & Drop or Click */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div
                id="dp-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#003c53] dark:border-[#94cef0] bg-[#abdefe]/20 dark:bg-[#104c67]/40 scale-102'
                    : 'border-[#c0c7ce] dark:border-white/20 hover:border-[#003c53] dark:hover:border-[#94cef0] hover:bg-[#f8f9fc] dark:hover:bg-[#23262a]'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-[#003c53]/10 dark:bg-[#94cef0]/20 text-[#003c53] dark:text-[#94cef0] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[30px]">
                    {isLoading ? 'progress_activity' : 'add_a_photo'}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm text-[#191c1e] dark:text-white">
                    Drag and drop your photo here
                  </p>
                  <p className="text-xs text-[#71787e] dark:text-[#9aa2a9] mt-0.5">
                    or <span className="text-[#003c53] dark:text-[#94cef0] font-semibold underline">browse from your computer / phone</span>
                  </p>
                </div>
                <span className="text-[11px] text-[#71787e] bg-[#edeef0] dark:bg-[#282a2d] px-3 py-1 rounded-full font-medium">
                  Supports JPG, PNG, WebP • Auto-cropped & optimized
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Avatar Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#71787e] uppercase tracking-wider">
                Select from Curated Senior Profiles
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setPreviewUrl(preset.url);
                        setSuccessNotice(`Selected ${preset.label}`);
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border ${
                        isSelected
                          ? 'border-[#003c53] dark:border-[#94cef0] bg-[#003c53]/5 dark:bg-[#94cef0]/10 ring-2 ring-[#003c53] dark:ring-[#94cef0]'
                          : 'border-[#e1e2e5] dark:border-[#282a2d] hover:bg-[#edeef0] dark:hover:bg-[#282a2d]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-16 h-16 rounded-full object-cover shadow-sm"
                      />
                      <span className="text-[11px] font-semibold text-[#191c1e] dark:text-white line-clamp-2">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Web Image URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#71787e] uppercase tracking-wider">
                Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  id="dp-url-input"
                  type="url"
                  placeholder="https://images.example.com/photo.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#f2f4f6] dark:bg-[#282a2d] border border-[#c0c7ce]/50 text-xs focus:outline-none focus:ring-2 focus:ring-[#003c53]"
                />
                <button
                  id="apply-dp-url-btn"
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#003c53] text-white text-xs font-bold hover:bg-[#0b5471] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Checking...' : 'Load'}
                </button>
              </div>
              <p className="text-[11px] text-[#71787e]">
                Direct links to JPEG, PNG, or WebP images are supported.
              </p>
            </div>
          )}

          {/* Feedback banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2 border border-red-200 dark:border-red-900/50">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-900/50">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#e1e2e5] dark:border-[#282a2d] flex items-center justify-between bg-[#f8f9fc] dark:bg-[#181a1c] gap-3">
          <button
            id="reset-dp-default-btn"
            type="button"
            onClick={handleResetToDefault}
            className="text-xs font-semibold text-[#71787e] hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              id="cancel-dp-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#edeef0] dark:bg-[#282a2d] text-xs font-bold text-[#40484d] dark:text-[#c0c7ce] hover:bg-[#e1e2e5]"
            >
              Cancel
            </button>
            <button
              id="save-dp-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-[#003c53] hover:bg-[#0b5471] dark:bg-[#94cef0] dark:text-[#001e2c] text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">done</span>
              <span>Save as Profile Picture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
