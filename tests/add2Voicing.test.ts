import { parseChordInput } from '../src/chord'
import { getVoicingMidiNotes } from '../src/voicing'

const cAdd2 = parseChordInput('C大調 Iadd2').chords[0]
const cAdd9 = parseChordInput('C大調 Iadd9').chords[0]
const amAdd2 = parseChordInput('A小調 iadd2').chords[0]

if (cAdd2.name !== 'Cadd2' || cAdd2.notes.join(' ') !== 'C D E G') throw new Error('Cadd2 spelling failed')
if (cAdd9.notes.join(' ') !== 'C E G D') throw new Error('Cadd9 display order changed')
if (amAdd2.name !== 'Amadd2' || amAdd2.notes.join(' ') !== 'A B C E') throw new Error('Amadd2 spelling failed')

if (JSON.stringify(getVoicingMidiNotes(cAdd2, 0, 4)) !== JSON.stringify([60, 62, 64, 67])) {
  throw new Error('Cadd2 close voicing failed')
}
if (JSON.stringify(getVoicingMidiNotes(cAdd9, 0, 4)) !== JSON.stringify([60, 64, 67, 74])) {
  throw new Error('Cadd9 open voicing failed')
}

console.log('Core add2/add9 voicing tests passed.')
