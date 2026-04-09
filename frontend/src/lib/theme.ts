/**
 * SISTEMA DE DISEÑO CENTRALIZADO
 * ================================
 * Define todos los valores de diseño, colores, espaciados, etc.
 * para mantener consistencia en toda la aplicación.
 */

// ========================================
// COLORES
// ========================================
export const colors = {
  // Primarios
  primary: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0369a1',
    contrast: '#ffffff',
  },
  
  // Secundarios (neutros)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    500: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
  
  // Estados
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  
  // Blockchain específico
  blockchain: {
    main: '#8b5cf6',
    light: '#a78bfa',
    dark: '#7c3aed',
  },
} as const;

// ========================================
// ESPACIADO
// ========================================
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// ========================================
// TIPOGRAFÍA
// ========================================
export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Consolas', monospace",
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
} as const;

// ========================================
// SOMBRAS
// ========================================
export const shadows = {
  none: 'none',
  soft: '0 2px 8px rgba(0, 0, 0, 0.05)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.08)',
  strong: '0 8px 24px rgba(0, 0, 0, 0.12)',
  focus: '0 0 0 3px rgba(14, 165, 233, 0.2)',
} as const;

// ========================================
// RADIOS DE BORDE
// ========================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  lg: '0.75rem',   // 12px
  card: '12px',
  full: '9999px',
} as const;

// ========================================
// TRANSICIONES
// ========================================
export const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

// ========================================
// BREAKPOINTS RESPONSIVE
// ========================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ========================================
// Z-INDEX
// ========================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  tooltip: 1050,
} as const;

// ========================================
// ICONOS Y TAMAÑOS
// ========================================
export const iconSizes = {
  xs: '16px',
  sm: '20px',
  base: '24px',
  lg: '32px',
  xl: '48px',
} as const;

// ========================================
// ESTADOS DE BLOCKCHAIN
// ========================================
export const blockchainStatus = {
  PREPARING: {
    label: 'Preparando',
    color: colors.primary.main,
    bgColor: '#dbeafe',
    icon: '📝',
  },
  TX_SUBMITTED: {
    label: 'Transacción Enviada',
    color: colors.warning.main,
    bgColor: '#fef3c7',
    icon: '⏳',
  },
  SYNCED: {
    label: 'Sincronizado',
    color: colors.success.main,
    bgColor: '#d1fae5',
    icon: '✓',
  },
  FAILED: {
    label: 'Error',
    color: colors.error.main,
    bgColor: '#fee2e2',
    icon: '✗',
  },
} as const;

// ========================================
// ROLES DE USUARIO
// ========================================
export const userRoles = {
  ADMIN: {
    label: 'Administrador',
    color: colors.blockchain.main,
    permissions: ['all'],
  },
  USER: {
    label: 'Usuario',
    color: colors.primary.main,
    permissions: ['read', 'write', 'share'],
  },
  SHARED_READ: {
    label: 'Lectura',
    color: colors.secondary[500],
    permissions: ['read'],
  },
  SHARED_WRITE: {
    label: 'Escritura',
    color: colors.primary.light,
    permissions: ['read', 'write'],
  },
  SHARED_ADMIN: {
    label: 'Admin Compartido',
    color: colors.blockchain.light,
    permissions: ['read', 'write', 'share'],
  },
} as const;

// ========================================
// CONFIGURACIÓN DE LAYOUT
// ========================================
export const layout = {
  sidebar: {
    width: '256px',
    collapsedWidth: '64px',
  },
  header: {
    height: '64px',
  },
  footer: {
    height: '48px',
  },
  maxWidth: {
    page: '1280px',
    card: '800px',
    modal: '600px',
  },
} as const;

// ========================================
// CONFIGURACIÓN DE ANIMACIONES
// ========================================
export const animations = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
  scale: 'scale 0.2s ease-in-out',
} as const;

// ========================================
// HELPER: Obtener color de estado blockchain
// ========================================
export const getBlockchainStatusColor = (status: keyof typeof blockchainStatus) => {
  return blockchainStatus[status] || blockchainStatus.PREPARING;
};

// ========================================
// HELPER: Obtener color de rol
// ========================================
export const getRoleColor = (role: keyof typeof userRoles) => {
  return userRoles[role] || userRoles.USER;
};

// ========================================
// EXPORTAR TODO COMO DEFAULT
// ========================================
export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  breakpoints,
  zIndex,
  iconSizes,
  blockchainStatus,
  userRoles,
  layout,
  animations,
} as const;

export default theme;
