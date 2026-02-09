import type { AudioCapabilities, BrowserInfo } from '../../types/audio';
import type { PermissionStatus } from '../../types/state';

interface MicInfoTableProps {
  capabilities: AudioCapabilities;
  browserInfo: BrowserInfo;
  permissionStatus: PermissionStatus;
}

// Support indicator component (defined outside to avoid recreation on each render)
function SupportIcon({ supported }: { supported: boolean }) {
  return (
    <span className={supported ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
      {supported ? '✅ Supported' : '❌ Not Supported'}
    </span>
  );
}

/**
 * Displays microphone and device information in a two-section table
 * Section 1: Microphone capabilities (sample rate, channels, settings)
 * Section 2: Browser and device info (name, OS, platform, API support)
 */
export default function MicInfoTable({ 
  capabilities, 
  browserInfo, 
  permissionStatus 
}: MicInfoTableProps) {
  
  // Format permission status with color
  const getPermissionDisplay = () => {
    const colors = {
      granted: 'text-green-600 dark:text-green-400',
      denied: 'text-red-600 dark:text-red-400',
      prompt: 'text-yellow-600 dark:text-yellow-400',
      unknown: 'text-slate-600 dark:text-slate-400',
    };
    
    const labels = {
      granted: 'Granted',
      denied: 'Denied',
      prompt: 'Prompt',
      unknown: 'Unknown',
    };
    
    return (
      <span className={colors[permissionStatus]}>
        {labels[permissionStatus]}
      </span>
    );
  };

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        {/* Microphone Information Section */}
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            <th 
              colSpan={2} 
              className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-slate-100"
            >
              Microphone Information
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400 w-1/2">Device Name</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{capabilities.label || 'Default Microphone'}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Sample Rate</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{capabilities.sampleRate} Hz</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Channels</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{capabilities.channelCount}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Echo Cancellation</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{capabilities.echoCancellation ? 'Yes' : 'No'}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Noise Suppression</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{capabilities.noiseSuppression ? 'Yes' : 'No'}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Auto Gain Control</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{capabilities.autoGainControl ? 'Yes' : 'No'}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Permission Status</td>
            <td className="px-4 py-2">{getPermissionDisplay()}</td>
          </tr>
        </tbody>

        {/* Your Device Section */}
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            <th 
              colSpan={2} 
              className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-slate-100"
            >
              Your Device
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Browser</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{browserInfo.name} {browserInfo.version}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Operating System</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{browserInfo.os}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Platform</td>
            <td className="px-4 py-2 text-slate-900 dark:text-slate-100">{browserInfo.platform}</td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">getUserMedia</td>
            <td className="px-4 py-2"><SupportIcon supported={browserInfo.supportsGetUserMedia} /></td>
          </tr>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">Permissions API</td>
            <td className="px-4 py-2"><SupportIcon supported={browserInfo.supportsPermissionsApi} /></td>
          </tr>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <td className="px-4 py-2 text-slate-600 dark:text-slate-400">MediaRecorder</td>
            <td className="px-4 py-2"><SupportIcon supported={browserInfo.supportsMediaRecorder} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
