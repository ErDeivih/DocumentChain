import React from 'react';
import {
  FileArchive,
  FileAudio,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DocumentTypeIconProps {
  fileExtension?: string | null;
  mimeType?: string | null;
  className?: string;
}

interface DocumentTypeVisual {
  icon: LucideIcon;
  colorClassName: string;
  backgroundClassName: string;
}

function normalizeExtension(fileExtension?: string | null): string {
  return (fileExtension || '').replace(/^\./, '').trim().toLowerCase();
}

function normalizeMimeType(mimeType?: string | null): string {
  return (mimeType || '').trim().toLowerCase();
}

export function getDocumentTypeVisual(
  fileExtension?: string | null,
  mimeType?: string | null
): DocumentTypeVisual {
  const extension = normalizeExtension(fileExtension);
  const type = normalizeMimeType(mimeType);

  if (extension === 'pdf' || type === 'application/pdf') {
    return {
      icon: FileText,
      colorClassName: 'text-red-600',
      backgroundClassName: 'bg-red-100',
    };
  }

  if (['doc', 'docx', 'odt', 'rtf'].includes(extension) || type.includes('word')) {
    return {
      icon: FileText,
      colorClassName: 'text-blue-600',
      backgroundClassName: 'bg-blue-100',
    };
  }

  if (
    ['xls', 'xlsx', 'ods', 'csv'].includes(extension) ||
    type.includes('spreadsheet') ||
    type === 'text/csv'
  ) {
    return {
      icon: FileSpreadsheet,
      colorClassName: 'text-emerald-600',
      backgroundClassName: 'bg-emerald-100',
    };
  }

  if (
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic'].includes(extension) ||
    type.startsWith('image/')
  ) {
    return {
      icon: FileImage,
      colorClassName: 'text-fuchsia-600',
      backgroundClassName: 'bg-fuchsia-100',
    };
  }

  if (
    ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension) ||
    type.startsWith('video/')
  ) {
    return {
      icon: FileVideo,
      colorClassName: 'text-violet-600',
      backgroundClassName: 'bg-violet-100',
    };
  }

  if (
    ['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension) ||
    type.startsWith('audio/')
  ) {
    return {
      icon: FileAudio,
      colorClassName: 'text-amber-600',
      backgroundClassName: 'bg-amber-100',
    };
  }

  if (
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) ||
    type.includes('zip') ||
    type.includes('compressed') ||
    type.includes('archive')
  ) {
    return {
      icon: FileArchive,
      colorClassName: 'text-stone-600',
      backgroundClassName: 'bg-stone-200',
    };
  }

  if (
    ['json', 'xml', 'yml', 'yaml', 'html', 'css', 'js', 'ts', 'md'].includes(extension) ||
    type === 'application/json' ||
    type.includes('javascript') ||
    type.includes('typescript') ||
    type.includes('xml')
  ) {
    return {
      icon: FileCode2,
      colorClassName: 'text-slate-700',
      backgroundClassName: 'bg-slate-200',
    };
  }

  return {
    icon: FileText,
    colorClassName: 'text-primary',
    backgroundClassName: 'bg-primary/10',
  };
}

export const DocumentTypeIcon: React.FC<DocumentTypeIconProps> = ({
  fileExtension,
  mimeType,
  className,
}) => {
  const { icon: Icon, colorClassName } = getDocumentTypeVisual(fileExtension, mimeType);
  return <Icon className={cn(colorClassName, className)} />;
};