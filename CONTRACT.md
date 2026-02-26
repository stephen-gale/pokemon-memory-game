# Pokémon Memory Game – Core Contract v1.0

This document defines the authoritative feature set for the Pokémon Memory Game.  
No feature may be removed unless explicitly deleted from this contract.

---

# 1️⃣ Core Gameplay

## Structure
- 151 rows (Generation 1 only)
- Fixed Pokédex order (1–151)
- One row per Pokémon

## Guess Input
- Live input (no Enter required)
- Accepts trailing spaces
- Accepts missing special characters (e.g. Farfetch’d → Farfetchd)
- Case insensitive
- No duplicate guesses allowed
- Input clears after correct guess

## Correct Guess Behaviour
- Pokémon name revealed in Title Case
- Gen 1 Red/Blue sprite displayed
- Pokémon cry plays
- No overlapping cries (interrupt previous cry)
- Row scrolls smoothly to center
- Row flashes/highlights briefly
- Counter updates immediately
- Progress auto-saves

---

# 2️⃣ Counter System

- Format: `X / Y`
- `Y` = number of Pokémon currently visible under active filters
- `X` = number guessed among visible Pokémon
- Counter recalculates instantly on:
  - Guess
  - Filter change
  - Reset
  - Give Up
- Must never show incorrect totals (no "149 bug")

---

# 3️⃣ Audio System

## Pokémon Cries
- Plays on correct guess only if the Pokémon is currently visible under active filters
- Stops previous cry if a new guess is entered
- Disabled if Cry toggle is off
- Toggle state persists across sessions

## Background Music
- 8-bit looping track
- OFF by default
- Starts on first user interaction
- Toggle state persists across sessions
- Fades out on:
  - Give Up
  - Completion
- Resumes after closing celebration overlay (if enabled)

## Celebration Sound
- Plays once on completion
- Does not overlap incorrectly with background music

---

# 4️⃣ Filters System (Pokémon Select Drawer)

## Drawer Behaviour
- Opens from Settings
- Slides up from bottom
- Tap outside closes
- Swipe down closes
- Locks background scroll while open

## Categories
- Starters (base forms only)
- Legendary and Mythical
- Normal
- Fire
- Water
- Electric
- Grass
- Ice
- Fighting
- Poison
- Ground
- Flying
- Psychic
- Bug
- Rock
- Ghost
- Dragon

## Filter Logic
- OR logic
- Pokémon appears once even if matches multiple categories
- Accept guess even if Pokémon currently hidden
- Filter changes apply instantly
- Completion recalculated instantly
- If all categories selected → show all 151 (no logic edge cases)
- If zero selected:
  - Show "No Pokémon selected"
  - Disable Done button
  - Cannot close drawer

## Controls
- Select All
- Unselect All
- Select All auto-checks when all individual boxes checked
- Unselect All clears everything

---

# 5️⃣ Give Up System

- Located in Settings
- Confirm modal appears before executing
- On confirm:
  - Reveal all unguessed Pokémon
  - Names displayed in red
  - Sprites grayscale
  - Cry does NOT play
  - Music fades out
  - Show "Show Only Missed" button
  - Auto-scroll to first missed Pokémon

---

# 6️⃣ Show Only Missed

- Button appears only after Give Up
- Toggle behaviour:
  - First press → show only missed Pokémon
  - Second press → show all
- Auto-scroll to first missed when enabled
- Does NOT modify filter state
- Reset hides the button

---

# 7️⃣ Completion System

Triggered when all visible Pokémon are guessed.

## Behaviour
- Fade out music
- Play celebration sound
- Show celebration overlay
- Prevent further guessing
- Closing overlay resumes music (if enabled)
- If filters change while complete:
  - Exit completion state
  - Recalculate counter

---

# 8️⃣ Reset System

Reset button located in Settings.

## Must:
- Clear guessed Pokémon
- Clear red styling
- Clear grayscale styling
- Remove sprite `src` attributes (prevent broken images)
- Restore all filters
- Hide "Show Only Missed" button
- Reset counter to `0 / 151`
- Close all overlays
- Clear input
- Restore music state correctly
- Preserve Cry toggle state
- Preserve Music toggle state

---

# 9️⃣ Auto-Save System

- Save guessed Pokémon IDs
- Restore progress on reload
- Does NOT auto-trigger completion on load
- Does NOT persist Give Up state

---

# 🔟 UI Integrity Requirements

- Settings overlay blocks background interaction
- Bottom sheet blocks background interaction
- No console errors
- No loading freeze
- No broken sprites after reset
- No incorrect counter states
- No accidental feature regressions

---

# Version Control Rule

Any new feature must:
1. Be added to this CONTRACT.md file
2. Be implemented in code
3. Be verified against this contract before release