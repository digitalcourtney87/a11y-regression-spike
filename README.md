# a11y-regression-spike

A research harness, not a product. It measures whether DOM-mutation and platform-event observation, and real NVDA speech, detect accessibility regressions that axe and accessibility-tree testing miss.

**Status:** Phase 0 (instrument validation). All results before the protocol freeze are **exploratory**.

- Brief: [HANDOFF.md](HANDOFF.md)
- Technical protocol extract: [docs/PRD-v0.3-technical-extract.md](docs/PRD-v0.3-technical-extract.md)
- Decisions: [docs/DECISIONS.md](docs/DECISIONS.md)
- Lab notebook: [docs/LAB_NOTEBOOK.md](docs/LAB_NOTEBOOK.md)

## Development

Requires Node 24.21.0 (see `.nvmrc`). Assistive-technology runs happen only on GitHub-hosted Windows runners.

**Security note:** the Guidepup NVDA build hosts NVDA's Remote Access relay on all network interfaces, using a public password and a certificate whose private key is published. Anything that can reach port 6837 while NVDA runs could send it keystrokes. Run it only on ephemeral hosted runners, never on a developer machine on an untrusted network (DR-0009).

```bash
npm ci
npm run lint
npm run typecheck
npm test
```

## Licence

The harness is licensed under Apache-2.0 (see [LICENSE](LICENSE) and [NOTICE](NOTICE)). Any NVDA add-on code would live in `adapters/nvda-addon/` under GPL-2.0-or-later.
