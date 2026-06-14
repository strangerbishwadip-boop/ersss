import { useRef } from 'react';
import { Camera, Video, X, Image, Film } from 'lucide-react';

interface FileAttachmentProps {
  photos: string[];
  videos: string[];
  onPhotosChange: (photos: string[]) => void;
  onVideosChange: (videos: string[]) => void;
  accent?: string;
}

export default function FileAttachment({ photos, videos, onPhotosChange, onVideosChange, accent = 'blue' }: FileAttachmentProps) {
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos = Array.from(files).map(f => URL.createObjectURL(f));
    onPhotosChange([...photos, ...newPhotos]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newVideos = Array.from(files).map(f => f.name);
    onVideosChange([...videos, ...newVideos]);
  };

  const removePhoto = (idx: number) => onPhotosChange(photos.filter((_, i) => i !== idx));
  const removeVideo = (idx: number) => onVideosChange(videos.filter((_, i) => i !== idx));

  const accentMap: Record<string, { bg: string; border: string; text: string; ring: string; btnBg: string; btnHover: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: 'focus:ring-blue-500', btnBg: 'bg-blue-100 hover:bg-blue-200', btnHover: 'text-blue-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: 'focus:ring-amber-500', btnBg: 'bg-amber-100 hover:bg-amber-200', btnHover: 'text-amber-700' },
    slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', ring: 'focus:ring-slate-500', btnBg: 'bg-slate-100 hover:bg-slate-200', btnHover: 'text-slate-700' },
  };
  const c = accentMap[accent] || accentMap.blue;

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
        Attachments (Optional)
      </label>
      
      {/* Upload buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className={`flex-1 h-11 ${c.btnBg} ${c.btnHover} rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition border ${c.border}`}
        >
          <Camera className="w-4 h-4" /> Attach Photo
        </button>
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          className={`flex-1 h-11 ${c.btnBg} ${c.btnHover} rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition border ${c.border}`}
        >
          <Video className="w-4 h-4" /> Attach Video
        </button>
      </div>

      <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
      <input ref={videoRef} type="file" accept="video/*" multiple onChange={handleVideoChange} className="hidden" />

      {/* Preview */}
      {(photos.length > 0 || videos.length > 0) && (
        <div className={`${c.bg} border ${c.border} p-3 rounded-xl`}>
          {photos.length > 0 && (
            <div className="mb-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Image className="w-3 h-3" /> Photos ({photos.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-white shadow-sm group">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {videos.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Film className="w-3 h-3" /> Videos ({videos.length})
              </p>
              <div className="space-y-1.5">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <Film className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium truncate">{v}</span>
                    </div>
                    <button type="button" onClick={() => removeVideo(i)} className="text-slate-400 hover:text-red-500 transition shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
