# Napkin Runbook

## Curation Rules

- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)

1. **[2026-09-30] Focus-into-view inside a scrollable popover fires a `scroll` event that looks like "user scrolled the page"**
   Do instead: in any window-level capture-phase scroll listener used to auto-close a popover/menu, first check `menuRef.current?.contains(e.target)` and ignore the event if true — otherwise selecting a mid-list option (which auto-scrolls the popover to bring the focused item into view) closes the popover instantly.
2. **`<details open={...}>` closes itself when the JSX branch computes `open` differently across renders (e.g. hardcoded `open` while editing vs `open={someFalseExpr}` while viewing)**
   Do instead: track open/closed as its own state kept in sync via the native `onToggle` event, and use one consistent `open={state}` expression in every render branch — never a literal `open` in one branch and a computed expression in another.
3. **Two same-specificity CSS class selectors (e.g. `.base` and `.base-modifier`) resolve by source order, not by which reads as "more specific"**
   Do instead: when adding a modifier class next to an existing base class, write the selector as `.base.modifier` (combined) so precedence doesn't depend on where it lands in the stylesheet.
4. **`element.click()` via CDP does not reliably reproduce a real user click for outside-click-to-close tests (no guaranteed `mousedown`)**
   Do instead: use `Input.dispatchMouseEvent` (`mousePressed` + `mouseReleased`) at real coordinates when testing "click outside closes X" behavior; `.click()` is fine for direct button/option activation.
5. **A generic feature wired into many pages (header-filter dropdowns, cell editing) hides bugs until tested past the first happy path**
   Do instead: after building the mechanism, test the *second* interaction (reopen, re-edit, re-select) not just the first — most bugs here surfaced only on the second use, not the first.

## Shell & Command Reliability

1. **Git Bash / MSYS mangles a leading `/` in script args (e.g. `/manuals` route strings) into a Windows path**
   Do instead: prefix with `MSYS_NO_PATHCONV=1` when a node script's argv contains a route-like string starting with `/`.
2. **`cat <<'EOF'` heredocs silently truncate/corrupt long files containing Korean (multi-byte UTF-8) text**
   Do instead: use the Write tool for any file with substantial Korean content; reserve bash heredocs for short ASCII-only snippets.
3. **Headless-Chrome CDP test/cleanup pattern that works reliably here**
   Do instead: launch `chrome.exe --headless=new --remote-debugging-port=9222 --user-data-dir=<temp>`, drive via raw WebSocket CDP (Target.createTarget/attachToTarget, Page.navigate+loadEventFired, Runtime.evaluate), and always tear down with PowerShell `Stop-Process` matching the chrome-smoke commandline + `Remove-Item -Recurse -Force` the temp profile dir.
4. **Demo login session key (`infodept.demo.session`) shares the `infodept.demo.` prefix with every per-table overlay key**
   Do instead: when clearing demo overlays for a clean test run, filter out `infodept.demo.session` explicitly (or clear then re-set login) — a blanket prefix-clear silently logs the test out and every subsequent row count reads 0.

## Domain Behavior Guardrails

1. **Google Sheet is the single source of truth; the sync job replaces DB tables wholesale**
   Do instead: any new write path (rentals, manuals, cell edits, future tables) must write the sheet first, then the DB — never DB-only, or the next sync silently reverts it.
2. **`shared/sheet-schema.js` drives demo data, seed SQL, sheet generation, sync, and cell-edit validation (`findEditableColumn`, `resolveRef`) — one schema, many consumers**
   Do instead: extend that file first when adding a table/column/edit rule; don't hardcode column lists per-page or per-function.
3. **A column displayed by joining another table (e.g. laptop's "부서", a classroom's grade/class_no shown on TV/cabinet rows) is not a real column of the row's own table**
   Do instead: never mark a joined/derived display column `editable: true` — only genuine own-columns of the row's table (per schema) get inline cell editing; the joined value is edited from its source table's own screen.
4. **Demo mode only persists edits for tables that have a `localStorage` overlay in `src/lib/data.js`'s `overlays` object**
   Do instead: when adding a new editable table, add its overlay there — reading straight from the static `src/data/demo.js` arrays means edits vanish on reload.

## User Directives

1. **[2026-09-24] "고민만", "가능 여부만" 이라고 하면 만들지 않는다**
   Do instead: 판단·선택지·근거만 답하고, 파일을 만들거나 고치지 않는다.
