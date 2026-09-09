const testModules = [
  '../tests/chordEngine.test.ts',
  '../tests/harmony.test.ts',
  '../tests/progression.test.ts',
  '../tests/performanceVoicing.test.ts',
  '../tests/voicing.test.ts',
  '../tests/add2Voicing.test.ts',
  '../tests/voiceLeading.test.ts',
  '../tests/midi.test.ts',
  '../tests/theoryAudit.test.ts',
]

for (const modulePath of testModules) {
  await import(new URL(modulePath, import.meta.url))
}

console.log(`ChordMate Core test suites passed (${testModules.length} suites).`)
