import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, AuthProvider } from '../contexts/AuthContext';
import React from 'react';

describe('AuthContext - useCallback fix', () => {
  it('should export useAuth hook and AuthProvider', () => {
    expect(useAuth).toBeDefined();
    expect(AuthProvider).toBeDefined();
  });

  it('should render hook without crashing', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(AuthProvider, null, children)
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });
});
