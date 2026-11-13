// ─── src/components/admin/image-uploader.tsx ───
// مكوّن رفع صور المنتجات — بيستخدم أندبوينت الرفع الموجود في المشروع
// (POST /api/admin/upload) زي ما هو — بدون أي مزوّد تخزين جديد أو تكرار.
// الميزات: اختيار متعدد من الجهاز، سحب وإفلات، معاينة فورية، شريط تقدم
// لكل صورة، رسائل خطأ واضحة، إعادة ترتيب، وتعيين الصورة الرئيسية.
// المكوّن بيرجّع قايمة الروابط للفورم — وفي قاعدة البيانات بتتخزن
// الروابط بس (مش ملفات) في جدول ProductImage (url / alt / position).
// الصورة الرئيسية = أول صورة في القايمة (position: 0).

"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, Star, ChevronUp, ChevronDown, Loader2 } from "lucide-react";

export interface UploadedImage {
  url: string;
  alt?: string;
  id?: string; // معرّف الصورة المحفوظة في قاعدة البيانات (بنده عند تعديل منتج موجود)
}

interface UploadTask {
  key: string;
  name: string;
  progress: number; // 0 - 100
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (next: UploadedImage[]) => void;
  /** أقصى عدد صور للمنتج */
  max?: number;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 ميجابايت — نفس حد أندبوينت الرفع
const ACCEPT = "image/jpeg,image/png,image/webp";

export function ImageUploader({ images, onChange, max = 8 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // نسخة محدّثة دايماً من القايمة عشان الرفع المتسلسل ما يضيعش أي تعديل من الفورم
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // رفع ملف واحد عبر أندبوينت الرفع الموجود — POST /api/admin/upload (FormData: file)
  // XHR مش fetch عشان نقدر نعرض نسبة التقدم الحقيقية لكل صورة
  const uploadOne = useCallback(
    (file: File, key: string) =>
      new Promise<string>((resolve, reject) => {
        const form = new FormData();
        form.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setTasks((prev) => prev.map((t) => (t.key === key ? { ...t, progress: pct } : t)));
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status === 200 && json?.success && json?.data?.url) {
              resolve(json.data.url as string);
            } else {
              reject(new Error(json?.error || `فشل رفع الصورة (رمز ${xhr.status})`));
            }
          } catch {
            reject(new Error(`فشل رفع الصورة (رمز ${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error("تعذر الاتصال بسيرفر الرفع"));
        xhr.send(form);
      }),
    []
  );

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const room = max - imagesRef.current.length;
    const picked = Array.from(fileList);
    if (room <= 0) {
      setError(`الحد الأقصى ${max} صور للمنتج — احذفي صورة الأول لو عايزة تضيفي غيرها`);
      return;
    }
    const valid = picked.filter((f) => ACCEPT.includes(f.type) && f.size <= MAX_SIZE).slice(0, room);
    if (valid.length === 0) {
      setError("الملفات المسموحة: JPG / PNG / WEBP وبحد أقصى 5 ميجابايت للصورة");
      return;
    }
    if (picked.length > valid.length) {
      setError(
        `تم قبول ${valid.length} صورة ورفض ${picked.length - valid.length} — المسموح: JPG/PNG/WEBP حتى 5 ميجا للصورة، والحد الأقصى ${max} صور`
      );
    }

    const newTasks: UploadTask[] = valid.map((f, i) => ({
      key: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      progress: 0,
    }));
    setTasks((prev) => [...prev, ...newTasks]);

    // رفع بالتسلسل صورة ورا صورة — عشان ترتيب الصور يفضل زي ترتيب اختيارها
    for (let i = 0; i < valid.length; i++) {
      const task = newTasks[i];
      try {
        const url = await uploadOne(valid[i], task.key);
        setTasks((prev) => prev.filter((t) => t.key !== task.key));
        onChange([...imagesRef.current, { url }]);
      } catch (err) {
        setTasks((prev) => prev.filter((t) => t.key !== task.key));
        const message = err instanceof Error ? err.message : "فشل رفع الصورة";
        setError(message);
      }
    }
  };

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  const makePrimary = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    const [item] = next.splice(idx, 1);
    onChange([item, ...next]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* منطقة السحب والإفلات / الاختيار من الجهاز */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`w-full border border-dashed rounded-xl p-6 flex flex-col items-center gap-1.5 transition-colors ${
          dragOver ? "border-brown bg-beige/40" : "border-hairline hover:border-brown/50 hover:bg-beige/30"
        }`}
      >
        <UploadCloud className="h-6 w-6 text-brown" />
        <span className="text-sm font-medium text-charcoal">
          اسحبي الصور هنا أو اضغطي للاختيار من الجهاز
        </span>
        <span className="text-[11px] text-muted-brand">
          JPG / PNG / WEBP — حتى 5 ميجا للصورة — يمكن اختيار أكثر من صورة معاً (الحد الأقصى {max})
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = ""; // عشان اختيار نفس الملف تاني يشتغل
        }}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* مهام الرفع الجارية بشريط تقدم لكل صورة */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.key} className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brown shrink-0" />
              <span className="text-xs text-muted-brand truncate max-w-[40%]">{t.name}</span>
              <div className="flex-1 h-1.5 bg-beige rounded-full overflow-hidden">
                <div className="h-full bg-brown rounded-full transition-all" style={{ width: `${t.progress}%` }} />
              </div>
              <span className="text-[10px] text-muted-brand w-8 text-left">{t.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* شبكة المعاينة: الصورة الأولى = الرئيسية */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id ?? `${img.url}-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-hairline bg-surface group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || "صورة المنتج"} className="w-full h-full object-cover" />

              {idx === 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brown text-cream text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                  رئيسية
                </span>
              )}

              {/* أدوات التحكم — على الموبايل دايماً ظاهرة، وعلى الديسكتوب عند المرور */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 p-1.5 bg-cream/90 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  title="تقديم في الترتيب"
                  className="p-1 rounded-md hover:bg-beige disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5 text-charcoal" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === images.length - 1}
                  title="تأخير في الترتيب"
                  className="p-1 rounded-md hover:bg-beige disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5 text-charcoal" />
                </button>
                <button
                  type="button"
                  onClick={() => makePrimary(idx)}
                  disabled={idx === 0}
                  title="تعيين كصورة رئيسية"
                  className="p-1 rounded-md hover:bg-beige disabled:opacity-30"
                >
                  <Star className="h-3.5 w-3.5 text-brown" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  title="حذف الصورة"
                  className="p-1 rounded-md hover:bg-beige"
                >
                  <X className="h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}