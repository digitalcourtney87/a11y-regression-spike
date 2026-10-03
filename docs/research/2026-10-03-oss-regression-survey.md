# Open-source accessibility regressions: first survey (2026-10-03)

**Label:** EXPLORATORY. **Purpose:** estimate how many `oss-history` patterns (corpus plan §2, §7) can be mined, because DR-0057 asks for the achievable pattern count to be reported to the owner before the split. **Method:** GitHub issue search (read-only), closed issues in each library whose title says "regression" and names focus, ARIA, keyboard, screen readers or accessibility. This is a title-only first pass; nothing was built or verified.

## Hits per library (closed issues, title search)

| Library | Hits | Plausibly an accessibility regression, from the title |
|---|---|---|
| Radix primitives | 29 (wider query) | Dialog/DropdownMenu auto-focus regression (#1615); DismissableLayer Escape handlers stale on React 19.2 (#4014); RadioGroup focus changes the value (#938) |
| Headless UI | 23 (wider query) | Nested menus broken (#3821); Combobox Escape not working in a modal (#1506); Combobox selects the active value when focus moves away (#2934) |
| Sonner | 4 | Headless version not passing role and aria attributes (#519) |
| Angular Components | 25 | MatDialog aria-modal regression (#25676); datepicker keyboard accessibility with screen readers (#17689) |
| MUI | 39 | Chip disabled accessibility regression (#30012); Chip keyboard events regression (#18236) |
| React Aria / Spectrum | 9 | ComboBox closes when navigating with the keyboard (#8298); ComboBox `onSelectionChange(null)` on blur (#9874) |
| Downshift | 3 | `useCombobox` isOpen state regression (#1680) |
| Chakra UI, Mantine, shadcn/ui, react-select, cmdk | 0–11 each | None clearly an accessibility regression |

## Estimate

- Title-only: about 15 plausible pairs across the 12 libraries searched.
- A deeper search (issue bodies, accessibility labels, "VoiceOver", "NVDA", "focus trap", "tab order", changelogs) is expected to give 30–40 candidates. Perhaps 20–30 would survive the corpus rules: both versions buildable, the behaviour reproducible in a fixture, mapping to a primary-analysis symptom, licence recorded.
- Each surviving pair is its own pattern (one mechanism in one library).

## Consequence for the pattern count

With Prompt to Page set aside (P18), patterns come from the SPA, which holds at most one pattern per catalogue mechanism (37), and from mined pairs (about 20–30). That gives about 57–67 regression patterns, short of the 110 approved under P15. The options are set out in DR-0058.

**Update (verification, DR-0063).** 47 candidates were read in two search rounds. 24 passed the documentary check and 11 survived verification; see `2026-10-03-oss-verification.md`. The pattern count is P21.
