import React, { useState, useRef } from 'react'
import {
  type TrainingDatabase,
  db as defaultDb,
  exportBackup,
  importBackup,
  shareOrDownloadBackup,
} from '../db'
import type { Dog } from '../types/db'
import {
  type BackupEnvelope,
  migrateBackupPayload,
} from '../types/portability'
import './SettingsModal.css'

export interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  db?: TrainingDatabase
  activeDog?: Dog | null
  onDataMutated?: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  db = defaultDb,
  activeDog,
  onDataMutated,
}) => {
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [stagedEnvelope, setStagedEnvelope] = useState<BackupEnvelope | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const clearFeedback = () => {
    setExportStatus(null)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleExportAll = async () => {
    clearFeedback()
    try {
      setIsProcessing(true)
      const envelope = await exportBackup(db, { scope: 'all' })
      const result = await shareOrDownloadBackup(envelope)
      setExportStatus(
        result.method === 'share'
          ? 'Backup shared via system share sheet.'
          : 'Backup exported and downloaded successfully.'
      )
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to export backup data.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportDog = async () => {
    if (!activeDog) return
    clearFeedback()
    try {
      setIsProcessing(true)
      const envelope = await exportBackup(db, {
        scope: 'dog',
        dogId: activeDog.id,
      })
      const result = await shareOrDownloadBackup(envelope)
      setExportStatus(
        result.method === 'share'
          ? `Progress for ${activeDog.name} shared successfully.`
          : `Progress for ${activeDog.name} downloaded successfully.`
      )
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to export dog data.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    clearFeedback()
    setStagedEnvelope(null)
    const file = e.target.files?.[0]
    if (!file) return

    try {
      let text = ''
      if (typeof file.text === 'function') {
        text = await file.text()
      } else {
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(reader.error)
          reader.readAsText(file)
        })
      }

      let rawJson: unknown
      try {
        rawJson = JSON.parse(text)
      } catch {
        throw new Error('Invalid file format: Not valid JSON.')
      }

      const validatedEnvelope = migrateBackupPayload(rawJson)
      setStagedEnvelope(validatedEnvelope)
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to parse backup envelope.'
      )
    } finally {
      // Reset input value to allow selecting the same file again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExecuteImport = async (mode: 'overwrite' | 'merge') => {
    if (!stagedEnvelope) return
    clearFeedback()
    try {
      setIsProcessing(true)
      const result = await importBackup(db, stagedEnvelope, { mode })
      setStagedEnvelope(null)
      setSuccessMessage(
        mode === 'overwrite'
          ? `Data successfully restored! (${result.importedDogCount} dog(s), ${result.importedProgressCount} progress records)`
          : `Data successfully merged! (${result.importedDogCount} dog(s), ${result.importedProgressCount} progress records)`
      )
      onDataMutated?.()
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Import failed.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className="settings-modal-backdrop"
      data-testid="settings-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="settings-modal-container"
        data-testid="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="settings-modal-header">
          <h2 id="settings-title" className="settings-modal-title">
            Data Portability & Settings
          </h2>
          <button
            type="button"
            className="settings-close-btn"
            data-testid="close-settings-btn"
            aria-label="Close settings"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="settings-modal-body">
          {/* Feedback Banners */}
          {errorMessage && (
            <div
              className="feedback-banner feedback-banner-error"
              data-testid="import-error-banner"
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="feedback-banner feedback-banner-success"
              data-testid="import-success-banner"
            >
              ✓ {successMessage}
            </div>
          )}

          {exportStatus && (
            <p
              className="status-text"
              data-testid="export-status-message"
            >
              ✓ {exportStatus}
            </p>
          )}

          {/* Export Section */}
          <section className="settings-section">
            <h3 className="settings-section-title">Export Backup</h3>
            <p className="settings-section-desc">
              Save your training history, dogs, and step mastery to a versioned
              JSON envelope.
            </p>
            <div className="settings-actions-group">
              <button
                type="button"
                className="settings-btn settings-btn-primary"
                data-testid="export-all-btn"
                disabled={isProcessing}
                onClick={handleExportAll}
              >
                📤 Export All Data
              </button>

              <button
                type="button"
                className="settings-btn settings-btn-secondary"
                data-testid="export-dog-btn"
                disabled={isProcessing || !activeDog}
                onClick={handleExportDog}
              >
                🐶 {activeDog ? `Export ${activeDog.name} Progress` : 'Export Current Dog Progress'}
              </button>
            </div>
          </section>

          {/* Import Section */}
          <section className="settings-section">
            <h3 className="settings-section-title">Import & Restore</h3>
            <p className="settings-section-desc">
              Restore from a backup envelope with strict schema validation.
            </p>

            {!stagedEnvelope ? (
              <div className="file-input-wrapper">
                <button
                  type="button"
                  className="settings-btn settings-btn-secondary"
                  disabled={isProcessing}
                >
                  📥 Select JSON Backup File...
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="file-input-hidden"
                  data-testid="import-file-input"
                  aria-label="Import Backup File"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div
                className="staged-import-card"
                data-testid="staged-import-card"
              >
                <h4 className="staged-import-title">📦 Backup File Loaded</h4>
                <p className="staged-import-meta">
                  Scope: <strong>{stagedEnvelope.exportScope}</strong> | Schema v
                  {stagedEnvelope.schemaVersion} (
                  {stagedEnvelope.data.dogs.length} dog(s),{' '}
                  {stagedEnvelope.data.stepProgress.length} progress record(s),{' '}
                  {stagedEnvelope.data.sessionLogs.length} drill log(s))
                </p>
                <span className="staged-strategy-prompt">
                  Choose conflict resolution strategy:
                </span>
                <div className="staged-buttons-grid">
                  <button
                    type="button"
                    className="settings-btn settings-btn-primary"
                    data-testid="import-mode-merge-btn"
                    disabled={isProcessing}
                    onClick={() => handleExecuteImport('merge')}
                  >
                    🔀 Merge with Existing (Preserve Local)
                  </button>
                  <button
                    type="button"
                    className="settings-btn settings-btn-danger"
                    data-testid="import-mode-overwrite-btn"
                    disabled={isProcessing}
                    onClick={() => handleExecuteImport('overwrite')}
                  >
                    ⚠️ Overwrite / Restore (Replace Database)
                  </button>
                  <button
                    type="button"
                    className="settings-btn settings-btn-secondary"
                    data-testid="cancel-staged-import-btn"
                    disabled={isProcessing}
                    onClick={() => setStagedEnvelope(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
