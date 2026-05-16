import React from 'react';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UserAvatar } from '../ui/UserAvatar';
import { Search, Loader2 } from 'lucide-react';

export interface UserSearchResult {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface UserSearchSelectorProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: UserSearchResult[];
  searching: boolean;
  onSearch: () => void;
  onSelectUser: (user: UserSearchResult) => void;
  isProcessing: boolean;
}

export const UserSearchSelector: React.FC<UserSearchSelectorProps> = ({
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searching,
  onSearch,
  onSelectUser,
  isProcessing,
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Buscar nuevo propietario</Label>
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Buscar por nombre de usuario o email"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          disabled={isProcessing}
        />
        <Button variant="outline" onClick={onSearch} disabled={searching || !searchQuery.trim() || isProcessing}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
    </div>

    {searchResults.length > 0 && (
      <div className="divide-y rounded-lg border border-border bg-white">
        {searchResults.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-secondary/35"
            disabled={isProcessing}
          >
            <UserAvatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} />
            <div className="flex-1">
              <p className="font-medium text-foreground">{user.fullName || user.username}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <Badge variant="outline">Seleccionar</Badge>
          </button>
        ))}
      </div>
    )}

    {searchQuery && searchResults.length === 0 && !searching && (
      <p className="py-4 text-center text-sm text-muted-foreground">No se encontraron usuarios con ese criterio</p>
    )}
  </div>
);
