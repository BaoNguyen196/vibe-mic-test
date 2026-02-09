import { ThemeToggle } from './theme-toggle';
import PermissionStatusBadge from './permission-status-badge';
import type { PermissionStatus } from '../../types/state';

interface HeaderProps {
  permissionStatus: PermissionStatus;
}

/**
 * App header component with title, permission badge, and theme toggle
 * Provides constant awareness of mic permission state
 */
export function Header({ permissionStatus }: HeaderProps) {
  return (
    <header className="border-b border-slate-300 dark:border-slate-700 transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Microphone Test</h1>
          <div className="flex items-center gap-3">
            <PermissionStatusBadge status={permissionStatus} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
