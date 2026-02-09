import { useEffect } from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Dismissible error banner with red styling
 * Shows at the top of the flow area with ARIA alert role
 * Dismissible with Escape key
 */
export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  // Handle Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg p-4 flex items-start gap-3"
    >
      {/* Error Icon */}
      <svg
        className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Error Message */}
      <p className="text-red-800 dark:text-red-200 flex-1 text-sm">
        {message}
      </p>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 
                   flex-shrink-0 
                   focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
        aria-label="Dismiss error (press Escape)"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
