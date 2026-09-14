import { InSessionTraining } from './components/InSessionTraining'
import trainingData from './data/training-levels.json'
import type { TrainingLevelsData } from './types/curriculum'

export function App() {
  return (
    <InSessionTraining
      curriculumData={trainingData as unknown as TrainingLevelsData}
    />
  )
}

export default App
