# Pokémon Memory Game — CONTRACT v3.0

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
- By default, Pokémon appear in National Pokédex order.
- Menu include an “Alphabetical ordering” toggle that changes list order to alphabetical by Pokémon name.I do
- One row is rendered per Pokémon.
- The total number of Pokémon is dynamic and depends on selected generations.

### Guessing Behavior

- Guess input is live (no Enter required).
- Input is case-insensitive.
- Minor formatting differences are tolerated (e.g., Farfetch’d → Farfetchd).
- Minor misspellings are accepted when the intended Pokémon is unambiguous.
- Menu include a “Spelling help” toggle to disable typo matching.
- The “Spelling help” toggle persists across resets.
- Duplicate guesses are ignored.
- Input clears on correct guess.

### Theme and Menu Toggles

- Header includes a timer visibility icon button next to Dark mode and Menu.
- When timer is shown, the icon is a clock with a line through it (hide action).
- When timer is hidden, the icon is a clock (show action).
- Timer visibility persists across refresh and reset.
- Header includes a dark mode icon button next to the Menu button.
- In light mode, the icon is a moon (switch to dark mode).
- In dark mode, the icon is a sun (switch to light mode).
- Dark mode persists across refresh and reset.
- Menu include an “Alphabetical ordering” toggle.
- Alphabetical ordering persists across refresh and reset.
- All checkboxes in Menu are displayed as toggle switches.

### On Correct Guess

- Pokémon name reveals in Title Case.
- A generation-appropriate game sprite is displayed.
- The Pokémon’s cry plays.
  - Any previously playing cry stops first.
  - Cries respect the cry toggle setting.
- The row scrolls into view.
- The row briefly highlights.
- The counter updates immediately.
- Every 3rd correct guess awards 1 hint token.

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
- Disabled when cry toggle is off.
- Toggle state persists across sessions.
- Only one cry may play at a time.

### Background Music

- 8-bit loop.
- OFF by default.
- Starts only after first user interaction.
- Toggle persists across sessions.
- Fades out on:
  - Give Up
  - Completion

### Celebration Sound

- Plays once on completion.
- Must not conflict with background music.

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

- Accessible from Menu.
- Requires confirmation modal.

### On Confirm

- Reveal all unguessed visible Pokémon.
- Apply “missed” state styling:
  - Red text
  - Grayscale sprite
- Music fades out.
- Cries do not play.
- Hint button is hidden.
- Show “Show Only Missed” button.
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
- Celebration overlay appears with:
  - Completion message
  - Time (if timer is visible)
  - Hints used (if hints are enabled)
  - "Pokémon Select" button to open the filter drawer
  - "Close" button to dismiss the overlay
- Further guessing is disabled.
- Clicking "Pokémon Select" closes the celebration overlay and opens the Pokémon Select drawer.

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
- Reset hint tokens to 0.
- Reset hints used to 0.
- Hide Show Only Missed button.
- Close overlays.
- Clear guess input.
- Preserve music and cry toggle persistence.
- Preserve hint settings (hints enabled, unlimited hints).
- Leave no modal or transient state active.

---

## 9. Auto-Save / Persistence

The game persists:

- Guessed Pokémon IDs.
- Generation filter selection.
- Category filter selection.
- Audio toggle states.
- Dark mode state.
- Spelling help state.
- Alphabetical ordering state.
- Hint settings (hints enabled, unlimited hints, keep open).
- Hint token count.
- Hints used count.

### On Reload

- Guessed Pokémon restore visually.
- Filters and generation selections restore.
- Theme and ordering preferences restore.
- Hint tokens and hints used restore.
- Hint keep open checkbox state restores.
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

- Menu and filter drawer block background interaction.
- No click-through behavior.
- Modal-style surfaces (menu panel and Pokémon Select drawer) use 90% viewport height for larger content capacity.
- No console errors.
- No frozen loading states.
- No broken sprites after reset.
- Counters and filters must always reflect correct visible totals.
- The system must scale correctly if additional generations are added in future.

---

## 12. Hint System

Players have access to a hint feature that provides clues for unguessed Pokémon.

### 12.1 Hint Button

- A lightbulb icon button floats in the bottom-right corner of the screen.
- The button is contained in a circular container.
- The button displays a badge in the top-right showing the number of available hint tokens.
- Badge styling: red circle with white text.
- When unlimited hints is enabled, the badge displays an infinity symbol (∞).
- When hint tokens are 0 (and unlimited hints is disabled), the button is greyed out and disabled.
- The button is hidden entirely when:
  - Hints are disabled in settings
  - The player has triggered Give Up
- The button includes proper accessibility: `aria-label="Use hint"`.

### 12.2 Hint Token Economy

- Players earn 1 hint token for every 3 correct guesses.
- Hint tokens accumulate even when hints are disabled in settings.
- If hints are re-enabled, accumulated tokens become available.
- Hint tokens reset to 0 when the game is reset.

### 12.3 Hint Dialog

When the hint button is clicked:

- A hint token is consumed immediately (unless unlimited hints is enabled).
- A dialog overlay appears showing:
  - The sprite of a random unguessed Pokémon from the current filter selection
  - The first 3 letters of the Pokémon's name
  - Remaining letters shown as underscores (e.g., "Bul______")
  - For Pokémon with names 3 characters or shorter, the full name is displayed
  - "Another hint" button to show a different random Pokémon hint
  - "Give Up" button to reveal the currently displayed Pokémon
  - "Close" button to dismiss the dialog
  - "Keep open" checkbox below the buttons
- The guess input field remains in focus during the hint dialog.
- When the player starts typing:
  - If "Keep open" is unchecked: the hint dialog automatically closes and input works normally
  - If "Keep open" is checked: the hint dialog remains visible, allowing continuous guessing with the hint visible
- Clicking outside the dialog also closes it.
- The dialog is keyboard-accessible and can be closed with the Escape key.

### 12.3.1 Another Hint Button

- The "Another hint" button appears in the hint dialog.
- When clicked, it displays a different random unguessed Pokémon hint.
- In normal mode:
  - Consumes 1 hint token per use
  - Disabled when no hint tokens remain (hintTokens === 0)
- In unlimited hints mode:
  - Always enabled
  - Does not consume tokens
  - Automatically updates to show a new hint when the currently displayed Pokémon is guessed correctly or given up
- Each use increments the hints used counter.

### 12.3.2 Reveal Button (Individual Pokémon)

- The "Reveal" button appears in the hint dialog.
- When clicked, reveals the currently displayed Pokémon:
  - Pokémon name is revealed in the list
  - Sprite is displayed with grayscale filter (shared class: `grayscale`)
  - Name is displayed in red text (shared class: `missed-name`)
  - Pokémon is scrolled into view
  - Pokémon is NOT counted toward completion
  - Pokémon will not appear in future hints
- Behavior after reveal:
  - In normal mode: hint dialog closes
  - In unlimited hints mode: automatically displays next unguessed Pokémon
- Revealed Pokémon are tracked separately from guessed Pokémon
- Revealed Pokémon are cleared on game reset
- Styling classes are shared with global Give Up to ensure consistency

### 12.4 Hint Settings

The Menu includes two hint-related toggles:

- "Hints enabled" toggle:
  - Controls visibility of the hint button
  - When disabled, the hint button is hidden
  - Hint tokens continue to accumulate in the background
  - Setting persists across sessions
  - Default: enabled

- "Unlimited hints" toggle:
  - When enabled, hints can be used without consuming tokens
  - The hint badge displays ∞ instead of a number
  - Setting persists across sessions
  - Default: disabled

### 12.5 Completion Display

- When the game is completed and hints are enabled, the completion overlay displays the number of hints used.
- Format: "Hints used: X"
- If hints are disabled at the time of completion, this information is hidden.
- Hints used counter resets to 0 when the game is reset.

### 12.6 Hint Persistence

The following hint-related data persists across sessions:

- Hints enabled setting
- Unlimited hints setting
- Current hint token count
- Hints used count
- Keep open checkbox state

All hint data resets to 0 when the game is reset (except settings).

---

## 13. Version Control Rule

Any new feature must:

1. Be added to this CONTRACT.md.
2. Be implemented in code.
3. Be verified against the contract before release.
