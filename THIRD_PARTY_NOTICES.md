# Third-Party Notices

## Status

This is a technical dependency-license inventory for the private `0.1.5` Core package. On 2026-09-09, all 52 lockfile package/platform entries were checked against their fixed local metadata or npm registry license field: 31 MIT entries and 21 Apache-2.0 entries; no missing, GPL, AGPL, or commercial-restriction license field was found. This is not legal advice or a substitute for the project owner's source-rights confirmation. ChordMate Core source code is licensed under MPL-2.0; see [LICENSE](./LICENSE) for the complete license text.

On 2026-09-09, `pnpm audit --json` reported zero known vulnerabilities for the current lockfile (0 info, 0 low, 0 moderate, 0 high, 0 critical). The prior `GHSA-67mh-4wv8-2f99` is not reported after `tsx` was updated to `4.20.6` and `esbuild` resolved to `0.25.12`. This is a point-in-time vulnerability result, not a completed license audit.

## Direct development dependencies

The package manifest directly declares these development/build dependencies:

| Package | Locked version | License field |
|---|---:|---|
| TypeScript | `7.0.2` | Apache-2.0 |
| tsx | `4.20.6` | MIT |

## Transitive build dependencies

The following are transitive dependencies observed in the current lockfile and installed metadata:

| Package | Locked version | License field |
|---|---:|---|
| esbuild | `0.25.12` | MIT |
| get-tsconfig | `4.14.3` | MIT |
| resolve-pkg-maps | `1.0.0` | MIT |

These packages are development/build tooling. The current generated Core output has no external runtime package imports. The lockfile also contains 26 MIT-licensed `@esbuild/*` platform packages and 20 Apache-2.0-licensed `@typescript/typescript-*` platform packages. The package tarball does not include `node_modules/` or platform binaries. New dependencies, lockfile updates, or third-party materials require a new review before publication.

## Materials not included

No guitar data, fonts, images, audio, or reusable templates have been confirmed as redistributable materials for this Core package. None are included in the current Core source or build output.

Do not add such material until its source, author, version, license, attribution requirement, modification rights, commercial-use rights, and redistribution evidence have been recorded and reviewed.
