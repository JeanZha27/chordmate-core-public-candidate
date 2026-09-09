import { createChordFromName } from '../src/chord'
import { getPerformanceVoicing } from '../src/voicing'

const source = { degree: 'I', degreeNumber: 1 }

const c9 = getPerformanceVoicing(createChordFromName('C9', source))
if (c9.performedNotes.join(' ') !== 'C E Bb D' || c9.omittedNotes.join(' ') !== 'G') {
  throw new Error('C9 performance voicing should omit the fifth')
}

const c11 = getPerformanceVoicing(createChordFromName('C11', source))
if (c11.performedNotes.join(' ') !== 'C Bb D F' || c11.omittedNotes.join(' ') !== 'E G') {
  throw new Error('C11 performance voicing should omit third and fifth')
}

const c13 = getPerformanceVoicing(createChordFromName('C13', source))
if (c13.theoreticalNotes.join(' ') !== 'C E G Bb D F A') {
  throw new Error('C13 theoretical structure should include the eleventh')
}
if (c13.performedNotes.join(' ') !== 'C E Bb D A' || c13.omittedNotes.join(' ') !== 'G F') {
  throw new Error('C13 performance voicing should omit the fifth and eleventh')
}

console.log('Core performance voicing tests passed.')
