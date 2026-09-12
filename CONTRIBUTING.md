# Contributing to ChordMate Core / 参与 ChordMate Core

Thank you for helping improve ChordMate Core. This repository is a deterministic TypeScript library for music-theory calculation and MIDI construction. It is not the ChordMate Basic application or a hosted product.

感谢你帮助改进 ChordMate Core。本仓库是用于音乐理论计算与 MIDI 构建的确定性 TypeScript 程序库；它不是 ChordMate Basic，也不是在线产品。

## Scope / 范围

- Keep contributions within Core's public boundary: chord parsing, scales, progressions, voicings, voice-leading metrics, and MIDI construction.
- Do not add UI, Web Audio, browser download adapters, guitar data, Studio logic, accounts, databases, hosted services, analytics, or private ChordMate product code.
- A supported input category is a product boundary, not an automatic claim about score-level harmonic analysis.

- 请将贡献限制在 Core 的公开边界：和弦解析、音阶、进行、排列、声部连接指标与 MIDI 构建。
- 不加入界面、Web Audio、浏览器下载适配器、吉他数据、Studio 逻辑、账户、数据库、托管服务、分析功能或私有 ChordMate 产品代码。
- 已支持的输入类别是产品边界，不自动构成对具体作品的完整和声分析结论。

## Before opening an Issue or Pull Request / 提交 Issue 或 Pull Request 前

- Describe the smallest reproducible input, expected result, and actual result.
- State what is in scope and what is deliberately not changed.
- Before submitting a code change, run:

```bash
pnpm test
pnpm typecheck
pnpm build
```

- 请提供最小可复现输入、预期结果与实际结果。
- 请说明修改范围，以及明确不改动的部分。
- 提交代码前，请运行以上三项本地验证。

## Security and private material / 安全与私密材料

Use GitHub private vulnerability reporting from the repository Security page for security issues. Do not disclose secrets, personal information, exploit details, or sensitive vulnerability information in public Issues, Pull Requests, comments, or Discussions.

安全问题请使用仓库 Security 页面的 GitHub 私密漏洞报告。不要在公开 Issue、Pull Request、评论或 Discussion 中披露密钥、个人信息、利用细节或其他敏感漏洞信息。

Do not commit credentials, personal data, Basic or Studio code, generated `dist/` output, local logs, or third-party materials without permission.

不要提交凭据、个人数据、Basic 或 Studio 代码、生成的 `dist/` 产物、本地日志，或未经授权的第三方材料。

## Maintainer boundaries / 维护边界

This project has no published response-time commitment, npm release schedule, hosted service, or automatic merge policy. A contribution can be discussed, accepted, declined, or deferred based on correctness, scope, maintainability, and release governance.

本项目不承诺响应时限、npm 发布时间、在线服务或自动合并。贡献会根据正确性、范围、可维护性与发布治理要求进行讨论、接受、拒绝或延期。
