interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Dismissible error banner with red styling
 * Shows at the top of the flow area with ARIA alert role
 */
export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
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
        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 flex-shrink-0"
        aria-label="Dismiss error"
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
