import { useState } from 'react'
import { HomeDashboard } from './components/HomeDashboard'
import { InSessionTraining } from './components/InSessionTraining'
import { db as defaultDb, type TrainingDatabase } from './db'
import trainingData from './data/training-levels.json'
import type { TrainingLevelsData } from './types/curriculum'

export interface AppProps {
  db?: TrainingDatabase
  curriculumData?: TrainingLevelsData
}

export function App({
  db = defaultDb,
  curriculumData = trainingData as unknown as TrainingLevelsData,
}: AppProps) {
  const [currentSurface, setCurrentSurface] = useState<'dashboard' | 'training'>(
    'dashboard'
  )
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>()
  const [selectedMode, setSelectedMode] = useState<'practice' | 'cold'>('practice')

  const handleStartDrill = (stepId: string, mode: 'practice' | 'cold') => {
    setSelectedStepId(stepId)
    setSelectedMode(mode)
    setCurrentSurface('training')
  }

  const handleBackToDashboard = () => {
    setCurrentSurface('dashboard')
  }

  if (currentSurface === 'training') {
    return (
      <InSessionTraining
        db={db}
        initialStepId={selectedStepId}
        initialMode={selectedMode}
        curriculumData={curriculumData}
        onBackToDashboard={handleBackToDashboard}
      />
    )
  }

  return (
    <HomeDashboard
      db={db}
      curriculumData={curriculumData}
      onStartDrill={handleStartDrill}
    />
  )
}

export default App
