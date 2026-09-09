# ChordMate Core API

The public entry point is `src/index.ts` and exposes 40 symbols. This document reflects the generated declarations from `dist/*.d.ts` for version `0.1.5`.

## Recommended public API

These functions cover the intended v0.1 workflows.

| Symbol | Purpose |
|---|---|
| `parseChordInput` | Parse a key/mode and degree progression into `ParseResult`. |
| `ChordParseError` / `ChordParseErrorCode` | Stable typed parser rejection. Callers may match `code`; unexpected exceptions must not be treated as valid syntax or theory-policy rejection. |
| `ChordConstructionError` / `ChordConstructionErrorCode` | Stable rejection for invalid standalone chord names or slash basses. |
| `createChordFromName` | Construct a `ChordResult` from a chord name and degree source. Accepts one chord name with an optional single `/bass`; standalone roots and slash basses use `A–G` with an optional single `#` or `b`. Unsupported spellings, including double accidentals in a slash bass, are rejected with `ChordConstructionErrorCode`. This is a product-input boundary, not a claim that such spellings are invalid music theory. |
| `buildScale` | Build a parsed major or natural-minor scale. |
| `getDiatonicChords` | Return seven diatonic chords for a key and mode. |
| `transposeProgression` | Rebuild a parsed degree progression in a target key and mode. |
| `getPerformanceVoicing` | Return performed tones, omitted tones, pitch classes, and explanation. |
| `getVoicingMidiNotes` | Return MIDI notes for a basic inversion and piano octave. |
| `getVoicingName` | Return a displayed chord/inversion name. |
| `evaluateVoiceLeading` | Measure movement, common tones, bass movement, and octave jumps. |
| `createConnectedVoicings` | Create connected voicings using `平稳`, `开阔`, or `戏剧性`. |
| `MidiValidationError` / `MidiValidationErrorCode` | Stable rejection for invalid MIDI-builder input, including malformed runtime container or metadata shapes. |
| `buildMidiFile` | Build a Standard MIDI file as `Uint8Array`; BPM is an integer from 30 to 240, MIDI pitches are integers from 0 to 127, and times must be finite and representable. |

## Low-level or compatibility-pending API

These exports are available but should be treated as lower-level until a stable compatibility policy is published.

| Symbol | Purpose |
|---|---|
| `degreeTokenForQuality` | Format a degree token from a degree number and chord quality. |
| `modeInput` | Build the parser input string used by scale helpers. |
| `buildProgressionInput` | Build the parser input string used by transposition. |
| `getPerformancePitchClasses` | Return pitch classes retained by a performance voicing. |
| `getMaximumInversion` | Return the supported inversion ceiling for a chord. |
| `createSmoothVoicings` | Convenience wrapper for `平稳` connected voicings. |
| `getVoicingNameFromMidi` | Derive a displayed voicing name from MIDI notes. |

## Constants

| Symbol | Purpose |
|---|---|
| `HARMONY_MAJOR_KEYS` | Supported major keys for scale helpers. |
| `HARMONY_MINOR_KEYS` | Supported natural-minor keys for scale helpers. |
| `MAJOR_TRANSPOSE_KEYS` | Supported major keys for transposition UI or validation. |
| `MINOR_TRANSPOSE_KEYS` | Supported natural-minor keys for transposition UI or validation. |

## Public types

| Type | Purpose |
|---|---|
| `Mode` | `'major' | 'minor'`. |
| `HarmonicSource` | Classification of the supplied harmonic source; it records Core’s supported input category rather than a score-level analytical conclusion. |
| `ChordQuality` | Supported chord-quality union. |
| `ChordResult` | Parsed chord name, degree, notes, pitch classes, quality, optional slash bass, and harmonic source (`diatonic`, `parallel-minor-mixture`, `applied`, `functional-chromatic`, or `standalone`). `functional-chromatic` marks explicit small-scale functional alterations such as `vii°7` and minor-key `V`/`V7`; it is not automatic proof of a score-level function. |
| `ParseResult` | Parsed key, mode, labels, progression text, and chords. |
| `MidiNote` | `{ midi, beat, durationBeats }` input for MIDI construction. |
| `MidiFileMetadata` | Optional descriptive track title and chord-text markers for `buildMidiFile`; it does not infer a work title, meter or key. |
| `MidiValidationErrorCode` | Stable codes for rejected runtime input shapes, tempo, chord duration, melody timing／pitch, and supplied chord voicings. |
| `PianoOctave` | Supported piano octaves: `3 | 4 | 5`. |
| `PerformanceVoicing` | Theoretical/performed notes, omitted notes, pitch classes, and explanation. |
| `VoicingStyle` | `'平稳' | '开阔' | '戏剧性'`. |
| `VoiceLeadingMetrics` | Movement, leap, common-tone, bass, and octave-jump metrics. |
| `SmoothVoicing` | Chosen inversion, MIDI notes, metrics, and style. |

## Compatibility boundary

The build is intended for ESM-aware bundlers. Native Node ESM direct execution is not currently promised. The API has no published stability or semantic-versioning guarantee yet.

## MIDI-array precondition for low-level voice-leading helpers

`evaluateVoiceLeading` and `getVoicingNameFromMidi` treat the first MIDI value as the lowest voice. Callers must therefore provide finite, ascending MIDI note arrays in the range `0–127`. Core-generated voicings satisfy this precondition. These helpers are heuristic arrangement tools, not a strict four-part-harmony validator or a general-purpose voice-matching algorithm.
