import { useState } from 'react'
import { HomeDashboard } from './components/HomeDashboard'
import { InSessionTraining } from './components/InSessionTraining'
import { LevelView } from './components/LevelView'
import { BehaviorDetailView } from './components/BehaviorDetailView'
import { ReferenceChapterView } from './components/ReferenceChapterView'
import { NavigationDrawer } from './components/NavigationDrawer'
import type { AppNavTarget } from './types/navigation'
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
  const [activeTarget, setActiveTarget] = useState<AppNavTarget>({
    type: 'dashboard',
  })
  const [previousTarget, setPreviousTarget] = useState<AppNavTarget>({
    type: 'dashboard',
  })
  const [isNavOpen, setIsNavOpen] = useState(false)

  const handleStartDrill = (stepId: string, mode: 'practice' | 'cold') => {
    setPreviousTarget(activeTarget)
    setActiveTarget({ type: 'training', stepId, mode })
  }

  const handleBackToDashboard = () => {
    setActiveTarget({ type: 'dashboard' })
  }

  const handleBackFromTraining = () => {
    if (previousTarget && previousTarget.type !== 'training') {
      setActiveTarget(previousTarget)
    } else {
      setActiveTarget({ type: 'dashboard' })
    }
  }

  const handleNavigate = (target: AppNavTarget) => {
    setPreviousTarget(activeTarget)
    setActiveTarget(target)
    setIsNavOpen(false)
  }

  const renderActiveSurface = () => {
    switch (activeTarget.type) {
      case 'training':
        return (
          <InSessionTraining
            db={db}
            initialStepId={activeTarget.stepId}
            initialMode={activeTarget.mode}
            curriculumData={curriculumData}
            onBackToDashboard={handleBackFromTraining}
          />
        )

      case 'level':
        return (
          <LevelView
            levelNumber={activeTarget.levelNumber}
            curriculumData={curriculumData}
            db={db}
            onSelectBehavior={(behaviorKey) =>
              setActiveTarget({
                type: 'behavior',
                levelNumber: activeTarget.levelNumber,
                behaviorKey,
              })
            }
            onStartDrill={handleStartDrill}
            onOpenNav={() => setIsNavOpen(true)}
            onBackToDashboard={handleBackToDashboard}
            onSelectLevel={(lvl) =>
              setActiveTarget({ type: 'level', levelNumber: lvl })
            }
          />
        )

      case 'behavior':
        return (
          <BehaviorDetailView
            levelNumber={activeTarget.levelNumber}
            behaviorKey={activeTarget.behaviorKey}
            curriculumData={curriculumData}
            db={db}
            onBackToLevel={() =>
              setActiveTarget({
                type: 'level',
                levelNumber: activeTarget.levelNumber,
              })
            }
            onStartDrill={handleStartDrill}
            onOpenNav={() => setIsNavOpen(true)}
            onBackToDashboard={handleBackToDashboard}
          />
        )

      case 'chapter':
        return (
          <ReferenceChapterView
            chapterId={activeTarget.chapterId}
            category={activeTarget.category}
            curriculumData={curriculumData}
            onNavigateChapter={(chapterId, category) =>
              setActiveTarget({ type: 'chapter', chapterId, category })
            }
            onOpenNav={() => setIsNavOpen(true)}
            onBackToDashboard={handleBackToDashboard}
          />
        )

      case 'dashboard':
      default:
        return (
          <HomeDashboard
            db={db}
            curriculumData={curriculumData}
            onStartDrill={handleStartDrill}
            onOpenNav={() => setIsNavOpen(true)}
            onNavigateLevel={(levelNumber) =>
              setActiveTarget({ type: 'level', levelNumber })
            }
          />
        )
    }
  }

  return (
    <>
      {renderActiveSurface()}
      <NavigationDrawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        curriculumData={curriculumData}
        onNavigate={handleNavigate}
        activeTarget={activeTarget}
      />
    </>
  )
}

export default App
