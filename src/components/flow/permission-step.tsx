import type { PermissionStatus } from '../../types/state';

interface PermissionStepProps {
  status: PermissionStatus;
  onRequestPermission: () => void;
  error: string | null;
  isLoading: boolean;
}

function PermissionStep({
  status,
  onRequestPermission,
  error,
  isLoading,
}: PermissionStepProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
        <span className="ml-3 text-slate-600 dark:text-slate-400">Requesting permission...</span>
      </div>
    );
  }

  // Granted state
  if (status === 'granted') {
    return (
      <div className="border border-green-500 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-green-600 dark:text-green-400 text-2xl mr-3">✓</span>
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Microphone Access Granted
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              You can now proceed to select your microphone device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Denied state
  if (status === 'denied') {
    return (
      <div className="border border-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-3">
          Microphone Blocked
        </h3>
        <p className="text-red-700 dark:text-red-300 mb-4">
          Your browser has blocked microphone access. To enable it:
        </p>
        <ul className="list-disc list-inside space-y-2 text-red-700 dark:text-red-300 text-sm">
          <li>
            <strong>Chrome:</strong> Click the lock icon in the address bar → Site settings →
            Microphone → Allow
          </li>
          <li>
            <strong>Safari:</strong> Safari menu → Settings → Websites → Microphone → Allow for
            this site
          </li>
          <li>
            <strong>Firefox:</strong> Click the shield or lock icon → Permissions → Microphone →
            Allow
          </li>
          <li>
            <strong>Edge:</strong> Click the lock icon → Permissions for this site → Microphone →
            Allow
          </li>
        </ul>
        <p className="text-red-600 dark:text-red-400 text-sm mt-4 font-medium">
          After updating permissions, please refresh the page.
        </p>
      </div>
    );
  }

  // Prompt or unknown state - request permission
  return (
    <div className="border border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
        Test Your Microphone
      </h3>
      <p className="text-blue-700 dark:text-blue-300 mb-4">
        Click the button below to grant microphone access. Your browser will prompt you for
        permission.
      </p>
      <button
        onClick={onRequestPermission}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
      >
        Test My Microphone
      </button>
      {error && (
        <div className="mt-4 text-red-600 dark:text-red-400 text-sm" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default PermissionStep;
