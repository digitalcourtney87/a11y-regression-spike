# G3 brief (one page)

**Result:** the confirmatory protocol is written in `protocol/PROTOCOL.md`. No test item has been executed or scored. The freeze tag is not created. Hash of the committed frozen set (those files last changed in `5ad4769`; docs commits do not change it). Recompute with `npm run protocol:hash` and tag only if it still prints this line:

`protocol-sha256: 190f715002354461c917991ecbaf30bff0a41804b5af35ee90fc0b59575f563a`

Full report: [G3.md](G3.md).

| # | Question (hard rule 12) | Why it matters | Recommendation |
|---|---|---|---|
| 1 | **Keep the three fixture edits** made after the split (DR-0086): the Vuetify card carries the dialog role and name; the Carbon combo box is followed by a button named after the chosen fruit; each Fluent card gets an id, and the page has a heading? | They are what makes those symptoms judgeable. None changes library code. The m3 reproductions ran on the earlier fixtures and are not re-run before the tag | **Yes** |
| 2 | **Freeze the known blind spots** rather than redesign those patterns? NVDA cannot see the Vuetify and Fluent symptoms on the base. Bootstrap's speech-only reading of the Escape is KEYBOARD_TRAP. Whether react-admin's busy-left-true shows a symptom is unknown | Redesigning them now would change the frozen corpus from what was built. Each is already stated as a limit in the protocol | **Yes** |
| 3 | **Adopt the BenignType descriptions** in PROTOCOL.md §5 as final (DR-0030)? They are the working descriptions already in use, and they are not scored | The names are fixed. The descriptions were left for this review | **Yes** |
| 4 | **Adopt the inconclusive range and the second round** (PRD §38, P37)? A headline comparison is inconclusive when its pattern-bootstrap 95% interval contains 0 and some value at least 0.08 from 0. That triggers 18 further regression patterns, from 59 to 77, not resized from the confirmatory counts | It decides whether, and how far, the confirmatory sample grows. 77 is the B2-versus-B size in the dev power table | **Yes** |
| 5 | **Adopt the rule-model secondary analysis** (DR-0023)? The earliest of three pre-declared B2 rules with the highest dev agreement. On the test split, report the rate at which C detects and the rule does not. It never changes a primary verdict | It is the pre-registered reading of how much NVDA adds beyond B2. The rule is chosen on the dev split only | **Yes** |
| 6 | **Create and push `protocol-freeze-v1`** on this commit, after items 1–5, with the hash above? Merge PR #9 first if you want the tag on `main` | The tag is what allows the test split to be scored and executed. Claude does not create it | **Yes** |

**For information (no decision needed):**

- **Attempts per side** stay as implemented: 3, or 5 for an `ANNOUNCEMENT_MISSING` pattern and the items beside it, k = n (DR-0068).
- **No weights file** has been supplied, so the secondary weighted analysis is not in this protocol. Supplying one later is an amendment.
- **M7** (the confirmatory run and the soak) is not started.
- **Cost:** single-agent, no Windows CI for this gate. Seventy iCloud conflict copies (`* 2.*`) were removed locally so the hash could be computed; they were git-ignored and not part of the tree.
