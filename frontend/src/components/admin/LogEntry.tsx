import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FileText,
  AlertTriangle,
  Info,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { LogEntry } from '../../api/logs';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
};

const getLevelColor = (level: string) => {
  switch (level.toUpperCase()) {
    case 'ERROR': return 'border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]';
    case 'WARN': return 'border-[#fcd34d] bg-[#fffbeb] text-[#92400e]';
    case 'INFO': return 'border-[#bae6fd] bg-[#f0f9ff] text-[#0f4c81]';
    default: return 'border-border bg-secondary/35 text-foreground';
  }
};

const getLevelIcon = (level: string) => {
  switch (level.toUpperCase()) {
    case 'ERROR': return <XCircle className="w-4 h-4" />;
    case 'WARN': return <AlertTriangle className="w-4 h-4" />;
    case 'INFO': return <Info className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

interface LogEntryProps {
  log: LogEntry;
}

export const LogEntryComponent: React.FC<LogEntryProps> = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-l-4 p-3 mb-2 rounded-r-lg transition-all ${getLevelColor(log.level)} hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">{getLevelIcon(log.level)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="outline" className="text-xs">{log.level}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{formatDate(log.timestamp)}</span>
            </div>
            <p className="break-words text-sm font-medium text-foreground">{log.message}</p>
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="mt-2 h-auto p-1 text-xs">
                {expanded ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                {expanded ? 'Ocultar' : 'Ver'} detalles
              </Button>
            )}
          </div>
        </div>
      </div>
      {expanded && log.metadata && (
        <div className="mt-3 pl-7">
          <div className="overflow-x-auto rounded-md border border-border bg-secondary/35 p-3 text-foreground">
            <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
