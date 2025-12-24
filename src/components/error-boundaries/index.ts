// Centralized export for all error boundaries
export { ErrorBoundary, withErrorBoundary } from '@/components/ui/error-boundary';
export { default as AdminErrorBoundary } from '@/components/admin/error-handling/AdminErrorBoundary';
export { default as SettingsErrorBoundary } from '@/components/admin/settings/SettingsErrorBoundary';
export { default as TabsErrorBoundary } from '@/components/admin/settings/TabsErrorBoundary';
export { default as RoleManagementErrorBoundary } from '@/components/admin/error-handling/RoleManagementErrorBoundary';

// New granular error boundaries
export { RouteErrorBoundary } from './RouteErrorBoundary';
export { FeatureErrorBoundary } from './FeatureErrorBoundary';
export { WidgetErrorBoundary } from './WidgetErrorBoundary';
export { DataErrorBoundary } from './DataErrorBoundary';
export { FormErrorBoundary } from './FormErrorBoundary';
