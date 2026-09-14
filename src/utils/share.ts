import type { BackupEnvelope } from '../types/portability'

/**
 * Triggers native Web Share API where supported, or falls back to direct JSON file download.
 */
export async function shareOrDownloadBackup(
  envelope: BackupEnvelope,
  customFilename?: string,
  navigatorObj: Navigator = typeof navigator !== 'undefined'
    ? navigator
    : ({} as Navigator)
): Promise<{ method: 'share' | 'download' }> {
  const jsonString = JSON.stringify(envelope, null, 2)
  const defaultDate = new Date().toISOString().split('T')[0]
  const filename =
    customFilename ||
    `training-levels-backup-${
      envelope.exportScope === 'dog' && envelope.dogId
        ? envelope.dogId
        : 'all'
    }-${defaultDate}.json`

  const blob = new Blob([jsonString], { type: 'application/json' })

  // Check if Web Share API with files is supported
  if (
    typeof navigatorObj?.canShare === 'function' &&
    typeof navigatorObj?.share === 'function' &&
    typeof File !== 'undefined'
  ) {
    try {
      const file = new File([blob], filename, { type: 'application/json' })
      if (navigatorObj.canShare({ files: [file] })) {
        await navigatorObj.share({
          title: 'Training Levels Backup',
          text: `Training Levels data export (${envelope.exportScope})`,
          files: [file],
        })
        return { method: 'share' }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { method: 'share' }
      }
    }
  }

  // Fallback: direct download via anchor
  if (
    typeof document !== 'undefined' &&
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function'
  ) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    if (typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(url)
    }
  }

  return { method: 'download' }
}
