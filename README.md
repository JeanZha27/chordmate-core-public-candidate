# ChordMate Core

English | [简体中文](./README.zh-CN.md)

ChordMate Core is a pure TypeScript music-theory library for chord parsing, scales, diatonic chords, transposition, piano voicings, voice leading, and MIDI file construction.

## Status

- Version: `0.1.5`
- Package status: `private: true`
- Repository status: public source repository for ChordMate Core `0.1.5`
- npm publication status: not published
- Build target: bundler ESM
- License for Core source code: MPL-2.0

This repository is not a hosted product and does not include an online demo or real user data.

## Verified capabilities

- Chord parsing and note spelling
- Major and natural-minor scales and diatonic chords
- Degree-based progression transposition
- Basic inversions, performance voicings, and add2/add9 voicings
- Voice-leading metrics and three voicing styles
- Pure MIDI file construction that returns `Uint8Array`

The Core package does not include React, browser DOM APIs, Web Audio, LocalStorage, download adapters, Studio logic, BGM logic, guitar data, or `chordFunction`.

## Verification status

The `0.1.5` pre-publication candidate is verified from a clean checkout with the Node.js and pnpm versions declared in `package.json` by running:

```bash
pnpm test
pnpm typecheck
pnpm build
```

The checks cover all 9 Core test suites, including 476 absolute chord structures and 25 supported key-system audits. The build emits 8 JavaScript files and 8 TypeScript declaration files. Release evidence is point-in-time evidence for this exact candidate; any source, dependency, lockfile, or build-configuration change requires a new verification run.

## Local use

The npm package remains unpublished, and `package.json` keeps `private: true`. For local work, install dependencies and build before consuming the generated output:

The reproducible build baseline is Node.js `24.19.0` and pnpm `11.19.0`. The same versions are declared in `package.json`; use a compatible Node 24 release and the declared pnpm version when reproducing a release check.

```bash
pnpm install --frozen-lockfile
pnpm build
```

`dist/` is intentionally not committed. Consumers working from a clone must run `pnpm build` themselves.

## Minimal API example

The npm package is not published yet. After building this checkout and linking it into an ESM-aware bundler project as `@chordmate/core`, the following code reads a degree progression as deterministic theory data. It does not play audio, download a file, or control a DAW.

```ts
import { parseChordInput } from '@chordmate/core'

const result = parseChordInput('C major I-vi-IV-V')

console.log(result.chords.map(({ name, notes }) => `${name}: ${notes.join(' · ')}`))
// [
//   'C: C · E · G',
//   'Am: A · C · E',
//   'F: F · A · C',
//   'G: G · B · D',
// ]
```

## Module compatibility

The generated output is intended for ESM-aware bundlers. It does not currently promise direct execution by native Node ESM because internal relative imports retain extensionless specifiers.

See [API.md](./API.md) for the 40 explicit public exports. This repository contains only the reusable, deterministic theory and MIDI-construction library. Browser UI, audio playback, downloads, user accounts, hosted services, analytics, and the private ChordMate Basic application are outside this repository.

## Security and licensing status

For bug reports and contributions, see [CONTRIBUTING.md](./CONTRIBUTING.md). Security issues must use the private reporting channel described in [SECURITY.md](./SECURITY.md).

Core source code is licensed under the Mozilla Public License 2.0; see [LICENSE](./LICENSE). A point-in-time dependency, privacy, credential, packaging, and clean-build review has been completed for this `0.1.5` candidate; this is not a guarantee that the software is free of defects or vulnerabilities. No GitHub Release or npm release has been made. See [SECURITY.md](./SECURITY.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
