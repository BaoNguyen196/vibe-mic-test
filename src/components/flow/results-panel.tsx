import type { TestMetrics, AudioCapabilities, BrowserInfo } from '../../types/audio';
import type { PermissionStatus } from '../../types/state';
import MicInfoTable from './mic-info-table';

interface ResultsPanelProps {
  metrics: TestMetrics;
  recordingUrl: string | null;
  capabilities: AudioCapabilities;
  browserInfo: BrowserInfo;
  permissionStatus: PermissionStatus;
  onTestAgain: () => void;
}

/**
 * Test results panel showing:
 * - Test metrics summary (peak, average, duration)
 * - Audio playback player
 * - Microphone info table
 * - Test again button
 */
export default function ResultsPanel({
  metrics,
  recordingUrl,
  capabilities,
  browserInfo,
  permissionStatus,
  onTestAgain,
}: ResultsPanelProps) {
  
  // Format level as percentage
  const formatLevel = (level: number) => {
    return `${(level * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Test Complete! ✅
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your microphone is working properly
        </p>
      </div>

      {/* Test Metrics Summary */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Test Results
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatLevel(metrics.peakLevel)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Peak Level
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatLevel(metrics.avgLevel)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Average Level
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.duration.toFixed(1)}s
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Duration
            </div>
          </div>
        </div>
      </div>

      {/* Audio Playback */}
      {recordingUrl && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recording Playback
          </h3>
          <audio
            controls
            src={recordingUrl}
            className="w-full"
            aria-label="Test recording playback"
          >
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {/* Microphone Info Table */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Device Information
        </h3>
        <MicInfoTable
          capabilities={capabilities}
          browserInfo={browserInfo}
          permissionStatus={permissionStatus}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onTestAgain}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Test Again
        </button>
      </div>
    </div>
  );
}
