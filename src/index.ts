export type { Mode, HarmonicSource, ChordQuality, ChordResult, ParseResult, MidiNote } from './model'

export {
  ChordParseError,
  ChordConstructionError,
  degreeTokenForQuality,
  createChordFromName,
  parseChordInput,
} from './chord'
export type { ChordConstructionErrorCode, ChordParseErrorCode } from './chord'

export {
  HARMONY_MAJOR_KEYS,
  HARMONY_MINOR_KEYS,
  modeInput,
  buildScale,
  getDiatonicChords,
} from './harmony'

export {
  MAJOR_TRANSPOSE_KEYS,
  MINOR_TRANSPOSE_KEYS,
  buildProgressionInput,
  transposeProgression,
} from './progression'

export type { PianoOctave, PerformanceVoicing } from './voicing'
export {
  getPerformanceVoicing,
  getPerformancePitchClasses,
  getMaximumInversion,
  getVoicingMidiNotes,
  getVoicingName,
} from './voicing'

export type { VoicingStyle, VoiceLeadingMetrics, SmoothVoicing } from './voice-leading'
export {
  evaluateVoiceLeading,
  createConnectedVoicings,
  createSmoothVoicings,
  getVoicingNameFromMidi,
} from './voice-leading'

export type { MidiFileMetadata, MidiValidationErrorCode } from './midi'
export { buildMidiFile, MidiValidationError } from './midi'
