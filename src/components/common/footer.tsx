/**
 * App footer component with privacy note
 * Emphasizes local processing and data privacy
 */
export function Footer() {
  return (
    <footer className="text-center text-xs text-slate-400 dark:text-slate-600 py-8 mt-12 transition-colors duration-200">
      <p>All audio processing happens locally in your browser. No data is sent to any server.</p>
    </footer>
  );
}
