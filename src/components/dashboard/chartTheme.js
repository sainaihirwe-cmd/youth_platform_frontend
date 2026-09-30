import { useTheme } from '../../context/ThemeContext';

// Validated categorical palette (fixed order, never cycled); dark steps are chosen for the dark surface.
const SERIES = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

// Status colours are reserved for application states and always shown with a text label.
const STATUS = {
  light: { pending: '#d97706', accepted: '#16a34a', rejected: '#dc2626' },
  dark: { pending: '#f59e0b', accepted: '#22c55e', rejected: '#f87171' },
};

export function useChartTheme() {
  const { isDark } = useTheme();
  const mode = isDark ? 'dark' : 'light';
  return {
    series: SERIES[mode],
    status: STATUS[mode],
    grid: isDark ? '#1f3358' : '#e8edf3',
    axis: isDark ? '#94a3b8' : '#64748b',
    surface: isDark ? '#0b1f3a' : '#ffffff',
    tooltip: {
      contentStyle: {
        background: isDark ? '#0b1f3a' : '#ffffff',
        border: `1px solid ${isDark ? '#213b69' : '#e2e8f0'}`,
        borderRadius: 12,
        fontSize: 12,
        color: isDark ? '#e2e8f0' : '#0f172a',
        boxShadow: '0 8px 24px rgb(11 31 58 / 0.12)',
      },
      labelStyle: { fontWeight: 600, color: isDark ? '#ffffff' : '#0b1f3a' },
      itemStyle: { color: isDark ? '#cbd5e1' : '#334155' },
      cursor: { fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)' },
    },
    tick: { fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
  };
}
