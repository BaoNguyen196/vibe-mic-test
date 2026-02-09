import type { BrowserInfo } from '../../types/audio';

interface BrowserInfoCardProps {
  browserInfo: BrowserInfo;
}

function BrowserInfoCard({ browserInfo }: BrowserInfoCardProps) {
  const {
    name,
    version,
    os,
    platform,
    supportsGetUserMedia,
    supportsPermissionsApi,
    supportsMediaRecorder,
  } = browserInfo;

  return (
    <div className="border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
        Your Device
      </h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Browser:</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">
            {name} {version}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">OS:</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{os}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600 dark:text-slate-400">Platform:</dt>
          <dd className="font-medium text-slate-900 dark:text-slate-100">{platform}</dd>
        </div>
        <hr className="border-slate-300 dark:border-slate-600" />
        <div className="flex justify-between items-center">
          <dt className="text-slate-600 dark:text-slate-400">getUserMedia:</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {supportsGetUserMedia ? '✅ Supported' : '❌ Not supported'}
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-slate-600 dark:text-slate-400">Permissions API:</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {supportsPermissionsApi ? '✅ Supported' : '⚠️ Limited (Safari)'}
          </dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-slate-600 dark:text-slate-400">MediaRecorder:</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {supportsMediaRecorder ? '✅ Supported' : '❌ Not supported'}
          </dd>
        </div>
      </dl>
      {!supportsGetUserMedia && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          ⚠️ Your browser cannot access the microphone. Please upgrade to a modern browser.
        </div>
      )}
    </div>
  );
}

export default BrowserInfoCard;
