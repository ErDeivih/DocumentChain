import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Upload, File, X } from 'lucide-react';

interface FileDropZoneProps {
  file: File | null;
  isProcessing: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  file,
  isProcessing,
  isDragging,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
  onClearFile,
}) => (
  <div
    className={cn(
      'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
      isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
    )}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    {!file ? (
      <>
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium mb-1">Arrastre y suelte su archivo aquí</p>
        <p className="text-sm text-muted-foreground mb-4">o</p>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
          Explorar Archivos
        </Button>
        <p className="text-xs text-muted-foreground mt-3">Tamaño máximo de archivo: 100MB</p>
      </>
    ) : (
      <div className="flex items-center justify-between bg-accent p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <File className="w-8 h-8 text-primary" />
          <div className="text-left">
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button type="button" onClick={onClearFile} className="text-muted-foreground hover:text-foreground" disabled={isProcessing}>
          <X className="w-5 h-5" />
        </button>
      </div>
    )}
    <input ref={fileInputRef} type="file" className="hidden" onChange={onFileInputChange} disabled={isProcessing} />
  </div>
);
