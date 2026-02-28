# Pokémon Memory Game — CONTRACT v3.1

---

## 1. Core Gameplay

- The game displays Pokémon from selected generations.
- Supported generations:
  - Gen 1 (National Dex #1–151)
  - Gen 2 (National Dex #152–251)
  - Gen 3 (National Dex #252–386)
  - Gen 4 (National Dex #387–493)
  - Gen 5 (National Dex #494–649)
  - Gen 6 (National Dex #650–721)
  - Gen 7 (National Dex #722–809)
  - Gen 8 (National Dex #810–905)
  - Gen 9 (National Dex #906–1025)
- Pokémon appear in National Pokédex order.
- One row is rendered per Pokémon.
- The total number of Pokémon is dynamic and depends on selected generations.

### Guessing Behavior

- Guess input is live (no Enter required).
- Input is case-insensitive.
- Minor formatting differences are tolerated (e.g., Farfetch’d → Farfetchd).
- Minor misspellings are accepted when the intended Pokémon is unambiguous.
- Settings include a “Mispelling acceptance” toggle to disable typo matching.
- The “Mispelling acceptance” toggle persists across resets.
- Duplicate guesses are ignored.
- Input clears on correct guess.

### Theme and Settings Toggles

- Header includes a timer visibility icon button next to Dark mode and Settings.
- When timer is shown, the icon is 🚫 (hide action).
- When timer is hidden, the icon is a clock (show action).
- Timer visibility persists across refresh and reset.
- Header includes a dark mode icon button next to the Settings button.
- In light mode, the icon is a moon (switch to dark mode).
- In dark mode, the icon is a sun (switch to light mode).
- Dark mode persists across refresh and reset.
- Header includes an audio mute icon button next to Dark mode and Settings.
- When audio is currently enabled, the icon is 🔇 (mute action).
- When audio is currently muted, the icon is 🔊 (unmute action).
- The audio mute state persists across refresh and reset.
- Header icon buttons use neutral grey styling (not red primary action styling).
- All checkboxes in Settings are displayed as toggle switches.

### On Correct Guess

- Pokémon name reveals in Title Case.
- A generation-appropriate game sprite is displayed.
- The Pokémon’s cry plays.
  - Any previously playing cry stops first.
  - Cries respect the global audio mute state.
- The row scrolls into view.
- The row briefly highlights.
- The counter updates immediately.

---

## 2. Counter System

- Counter displays as: `X / Y`

Where:
- `Y` = total number of Pokémon currently visible based on generation and category filters.
- `X` = number of correctly guessed Pokémon among those visible.

### Counter Rules

- The counter recalculates immediately when:
  - A correct guess is made
  - Filters change
  - Generation selection changes
  - Reset is triggered
  - Give Up is triggered
- The counter displays a guessed percentage next to `X / Y`.
- The counter must never display incorrect totals.
- No hardcoded totals (e.g., 151).
- Reset sets counter to `0 / totalVisiblePokemon`.

---

## 3. Audio System

### Pokémon Cries

- Play only on correct guesses for visible Pokémon.
- Disabled when global audio mute is enabled.
- Only one cry may play at a time.

### Background Music

- 8-bit loop.
- Starts only after first user interaction (unless audio is muted).
- Obeys global audio mute state.
- Fades out on:
  - Give Up
  - Completion

### Celebration Sound

- Plays once on completion.
- Must not conflict with background music.
- Stops immediately if the celebration modal is closed.

### Global Audio Mute

- A single header mute toggle controls all audio.
- Muting must silence:
  - Pokémon cries
  - Background music
  - Celebration sound
- Mute state persists across sessions and resets.

---

## 4. Filters System

The Pokémon Select drawer allows filtering of visible Pokémon.

Filter state persists across refresh.

### 4.1 Generation Filters

- Generation selection appears as a dedicated section within the Pokémon Select drawer.
- The generation section must be visually separated from other filter categories (e.g., divider or section header).
- Available options:
  - Gen 1 through Gen 9
- All generations are selected by default.
- The user may temporarily uncheck all generations.
- The “Done” button is disabled if no generation is selected.
- Generation selection persists across refresh.

### 4.2 Category Filters

- Includes types, starter lines, legendary groupings, etc.
- Includes Stage 1, Stage 2, and Stage 3 filters.
- Multiple categories may be selected simultaneously.
- Category filter logic uses OR behavior.

### 4.3 Filter Logic Definition

A Pokémon is visible if:

- It matches at least one selected generation  
AND  
- It matches at least one selected category  
  OR no category filters are selected

Generation acts as a top-level gate and is not merged into OR category logic.

### 4.4 Select All / Unselect All

- Behaves consistently with existing filter logic.
- Select All and Unselect All apply to both generation and category checkboxes.
- Must not allow the Done button to close the drawer if no generations are selected.

### 4.5 Filter Drawer Sections

- Generation and Categories sections use accordion-style hide/show headers.
- Both sections are expanded by default.
- Collapsing sections does not change selected filters.

---

## 5. Give Up System

- Accessible from a button adjacent to the guess input.
- Requires confirmation modal.

### On Confirm

- Reveal all unguessed visible Pokémon.
- Apply “missed” state styling:
  - Red text
  - Grayscale sprite
- Music fades out.
- Cries do not play.
- Show a post-Give Up action row:
  - “Show Only Missed” button on the left
  - “Reset” button on the right
- Auto-scroll to first missed Pokémon.
- Does not modify filter or generation selections.

---

## 6. Show Only Missed

- Only appears after Give Up.
- Toggles between:
  - Showing only missed Pokémon
  - Showing all visible Pokémon
- Does not modify filters or generation selections.
- Scrolls to first missed Pokémon when toggled on.
- Hidden when Reset is triggered.

---

## 7. Completion State

Completion occurs when:

All currently visible Pokémon are guessed.

Visible Pokémon are determined by active generation and category filters.

### On Completion

- Music fades out.
- Celebration sound plays once.
- Celebration overlay appears.
- Further guessing is disabled.

### Filter or Generation Changes During Completion

- Completion state exits automatically if newly visible Pokémon are unguessed.
- Counter recalculates immediately.
- Guessing re-enables if appropriate.

Completion is always tied to currently visible Pokémon, not total stored guesses.

---

## 8. Reset System

Reset must:

- Clear all guessed Pokémon.
- Remove all revealed and missed styling.
- Restore all supported generations selected.
- Restore all category filters.
- Recalculate visible Pokémon.
- Reset counter to `0 / totalVisiblePokemon`.
- Hide Show Only Missed button.
- Close overlays.
- Clear guess input.
- Preserve persisted settings state (audio mute, dark mode, timer visibility, misspelling acceptance).
- Leave no modal or transient state active.

---

## 9. Auto-Save / Persistence

The game persists:

- Guessed Pokémon IDs.
- Generation filter selection.
- Category filter selection.
- Global audio mute state.
- Dark mode state.
- Timer visibility state.
- Mispelling acceptance state.

### On Reload

- Guessed Pokémon restore visually.
- Filters and generation selections restore.
- Theme, timer visibility, and audio mute preferences restore.
- The game does not auto-trigger completion on load.
- Give Up state does not persist.

---

## 10. Data Architecture Requirements

- Pokémon data must include an explicit `generation` property.
- Generation must not be inferred from ID ranges.
- All total counts must derive from the current dataset.
- No hardcoded Pokémon totals are permitted anywhere in the codebase.

Example data structure:

- id: 152  
- name: Chikorita  
- generation: 2  
- types: grass  

---

## 11. UI Integrity Rules

- Settings and filter drawer block background interaction.
- No click-through behavior.
- Modal-style surfaces (settings panel and Pokémon Select drawer) use 90% viewport height for larger content capacity.
- No console errors.
- No frozen loading states.
- No broken sprites after reset.
- Counters and filters must always reflect correct visible totals.
- The system must scale correctly if additional generations are added in future.

---

## 12. Version Control Rule

Any new feature must:

1. Be added to this CONTRACT.md.
2. Be implemented in code.
3. Be verified against the contract before release.
