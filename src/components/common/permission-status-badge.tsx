import type { PermissionStatus } from '../../types/state';

interface PermissionStatusBadgeProps {
  status: PermissionStatus;
}

function PermissionStatusBadge({ status }: PermissionStatusBadgeProps) {
  const config: Record<
    PermissionStatus,
    { label: string; color: string; dotColor: string }
  > = {
    prompt: {
      label: 'Mic: Not requested',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      dotColor: 'bg-amber-500',
    },
    unknown: {
      label: 'Mic: Unknown',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      dotColor: 'bg-amber-500',
    },
    granted: {
      label: 'Mic: Allowed',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      dotColor: 'bg-green-500',
    },
    denied: {
      label: 'Mic: Blocked',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      dotColor: 'bg-red-500',
    },
  };

  const { label, color, dotColor } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

export default PermissionStatusBadge;
