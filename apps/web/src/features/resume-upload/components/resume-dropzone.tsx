import {
  MAX_RESUME_FILE_SIZE_BYTES,
  MAX_RESUME_FILE_SIZE_MB,
  SUPPORTED_RESUME_EXTENSIONS,
  SUPPORTED_RESUME_MIME_TYPES,
} from '@hireboost/shared';
import { FileText, FileWarning, UploadCloud, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/cn';

import { fileTypeLabel, formatFileSize } from '../lib/format';

const ACCEPT_ATTR = (SUPPORTED_RESUME_EXTENSIONS as readonly string[])
  .concat(SUPPORTED_RESUME_MIME_TYPES as readonly string[])
  .join(',');

interface ResumeDropzoneProps {
  /** Fired when a valid file is chosen and "Upload" is clicked. */
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  /** Upload progress 0-100 — wire up to axios onUploadProgress. */
  progress?: number;
  className?: string;
}

interface SelectedFile {
  file: File;
  /** A client-side-detected error such as "wrong type" or "too big". */
  error: string | null;
}

/**
 * A premium drag-and-drop resume uploader. Accepts PDF and DOCX, validates
 * type+size on the client (so we don't waste a network round-trip), and
 * shows real upload progress driven by the parent's `progress` prop.
 *
 * The component is fully keyboard-accessible: Enter / Space on the
 * focused dropzone opens the file picker.
 */
export function ResumeDropzone({
  onUpload,
  isUploading,
  progress = 0,
  className,
}: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // If a parent kicks off a fresh upload session, clear our staged selection
  // so the next idle state shows an empty dropzone.
  useEffect(() => {
    if (!isUploading && progress === 0) {
      // No-op — selection persists for retries.
    }
  }, [isUploading, progress]);

  const validateFile = useCallback((file: File): string | null => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    const validExt = (SUPPORTED_RESUME_EXTENSIONS as readonly string[]).includes(ext);
    const validMime =
      file.type === '' ||
      (SUPPORTED_RESUME_MIME_TYPES as readonly string[]).includes(file.type);

    if (!validExt || !validMime) {
      return 'Only PDF and DOCX files are supported.';
    }
    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      return `File is too large. Max size is ${MAX_RESUME_FILE_SIZE_MB} MB.`;
    }
    if (file.size === 0) {
      return 'This file appears to be empty.';
    }
    return null;
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file) return;
      const error = validateFile(file);
      setSelected({ file, error });
    },
    [validateFile],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Avoid flicker when entering child elements.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setIsDragging(false);
  };

  const openPicker = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  const handleClear = () => {
    setSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleStart = async () => {
    if (!selected || selected.error || isUploading) return;
    await onUpload(selected.file);
    // Keep the staged file visible until the parent navigates / removes it,
    // so the user sees what was just uploaded.
  };

  const canSubmit = Boolean(selected && !selected.error && !isUploading);
  const showProgress = isUploading && progress > 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-br from-primary/[0.06] to-transparent px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UploadCloud className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold leading-tight">Upload your resume</h2>
            <p className="text-xs text-muted-foreground">
              PDF or DOCX, up to {MAX_RESUME_FILE_SIZE_MB} MB. We'll parse every section
              automatically.
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Hidden native input — we drive it via the styled dropzone. */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-hidden
          tabIndex={-1}
        />

        {!selected ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume"
            onClick={openPicker}
            onKeyDown={onKeyDown}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(
              'group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-12 text-center transition-all',
              'hover:border-primary/60 hover:bg-primary/[0.04]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isDragging && 'border-primary bg-primary/[0.06] ring-2 ring-primary/30',
              isUploading && 'pointer-events-none opacity-60',
            )}
          >
            <span
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform',
                'group-hover:-translate-y-0.5',
                isDragging && 'scale-110',
              )}
            >
              <UploadCloud className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {isDragging ? 'Drop to upload' : 'Drag & drop your resume here'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or{' '}
                <span className="font-medium text-primary group-hover:underline">
                  click to browse
                </span>{' '}
                · PDF or DOCX · up to {MAX_RESUME_FILE_SIZE_MB} MB
              </p>
            </div>
          </div>
        ) : (
          <SelectedFileCard
            selection={selected}
            isUploading={isUploading}
            progress={progress}
            onClear={handleClear}
            onSubmit={handleStart}
            canSubmit={canSubmit}
            showProgress={showProgress}
            onReplace={openPicker}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Selected file card                              */
/* -------------------------------------------------------------------------- */

function SelectedFileCard({
  selection,
  isUploading,
  progress,
  showProgress,
  canSubmit,
  onClear,
  onSubmit,
  onReplace,
}: {
  selection: SelectedFile;
  isUploading: boolean;
  progress: number;
  showProgress: boolean;
  canSubmit: boolean;
  onClear: () => void;
  onSubmit: () => void;
  onReplace: () => void;
}) {
  const { file, error } = selection;
  const isError = Boolean(error);

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-4 transition-colors',
        isError ? 'border-destructive/40 bg-destructive/5' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
            isError ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
          )}
        >
          {isError ? (
            <FileWarning className="h-5 w-5" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" title={file.name}>
            {file.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {fileTypeLabel(file.type)} · {formatFileSize(file.size)}
          </p>

          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

          {showProgress && (
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}

          {isUploading && !showProgress && (
            <p className="mt-2 text-xs text-muted-foreground">
              Parsing your resume…
            </p>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Clear selected file"
          onClick={onClear}
          disabled={isUploading}
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onReplace}
          disabled={isUploading}
        >
          Replace file
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onSubmit}
          loading={isUploading}
          disabled={!canSubmit}
        >
          {isUploading ? 'Uploading…' : 'Upload & parse'}
        </Button>
      </div>
    </div>
  );
}
