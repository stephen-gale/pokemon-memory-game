# Pokémon Memory Game – Core Contract v1.0

This document defines the authoritative feature set for the Pokémon Memory Game.  
No feature may be removed unless explicitly deleted from this contract.

---

# 1. Core Gameplay

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

# 2. Counter System

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

# 3. Audio System

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

# 4. Filters System (Pokémon Select Drawer)

## Drawer Behaviour
- Opens from Settings
- Slides up from bottom
- Tap outside closes
- Swipe down closes
- Locks background scroll while open
- Tapping outside the Pokémon Select sheet closes the sheet (same as pressing Done).

## Categories
- Starters (full evolution lines)
(all evolution forms of the three Gen I starter Pokémon)
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
- Active category selections persist across page refresh via localStorage.
- Filter selections only reset when the Reset option in Settings is pressed.

## Controls
- Select All
- Unselect All
- Select All auto-checks when all individual boxes checked
- Unselect All clears everything

---

# 5. Give Up System

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

# 6. Show Only Missed

- Button appears only after Give Up
- Toggle behaviour:
  - First press → show only missed Pokémon
  - Second press → show all
- Auto-scroll to first missed when enabled
- Does NOT modify filter state
- Reset hides the button

---

# 7. Completion System

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

# 8. Reset System

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

# 9. Auto-Save System

- Save guessed Pokémon IDs
- Restore progress on reload
- Does NOT auto-trigger completion on load
- Does NOT persist Give Up state

---

# 10. Timer System

## Overview
An optional stopwatch Timer allows players to time their run.

The Timer counts upward and integrates with guessing, completion, filters, reset, and visibility behavior.

---

## Display & Layout

- The Timer and Play/Pause control appear on the same row as the Guess Counter.
- When the Timer is visible:
  - The Play/Pause control and Timer display are aligned to the left edge.
  - The Guess Counter is aligned to the right edge.
- When the Timer is hidden:
  - The Guess Counter is centered horizontally.
- The Timer and Guess Counter must not overlap at any viewport width.
- Timer format is `MM:SS`.
- Timer starts at `00:00`.

---

## Timer Limits

- Timer counts upward.
- Timer caps at **99:59**.
- Upon reaching 99:59:
  - Timer stops.
  - Play/Pause control displays Pause state.
  - Play/Pause control becomes disabled.
  - Time remains frozen at 99:59.

---

## Start Behaviour

The Timer starts when:
- The Play button is pressed, or
- Any guess is entered (correct or incorrect, visible or filtered).

The Timer:
- Transitions from Stopped or Paused to Running.
- Does not restart if in Locked state.

---

## Pause Behaviour

The Timer pauses when:
- Play/Pause control is pressed while running.
- The Settings overlay is opened.
- The browser tab or window loses visibility (tab switch, minimize, device lock).

When visibility returns:
- The Timer remains paused.
- It resumes only when Play is pressed or a guess is entered.

Pausing does not disable guessing.

---

## Completion & Give Up Behaviour

Upon completion (all visible Pokémon guessed):
- Timer pauses.
- Timer enters Locked state.
- Play/Pause control displays Pause and is disabled.
- Elapsed time appears on the Completion screen if the Timer is visible.

Upon Give Up:
- Timer pauses.
- Timer enters Locked state.
- Play/Pause control displays Pause and is disabled.
- Elapsed time appears on the Completion screen if the Timer is visible.

---

## Filter Interaction

- Changing filters does not pause or reset the Timer.
- Timer continues running while filters are adjusted.

---

## Hide Timer Behaviour

- Settings include a “Hide Timer” option.
- When enabled:
  - Timer display and Play/Pause control are hidden.
  - Timer continues functioning in the background.
  - Completion screen does not display elapsed time.
- When disabled:
  - Timer display reappears.
  - Current elapsed time is shown.
- Hide Timer setting persists across refresh.
- Reset does not change the Hide Timer setting.

---

## Reset Behaviour

Reset:
- Resets Timer to `00:00`.
- Returns Timer to Stopped state.
- Re-enables Play/Pause control.
- Does not change Hide Timer setting.
- Does not change Audio settings.

---

## Persistence

- Timer state (Stopped, Paused, Locked) and elapsed time persist across refresh.
- If refreshed while Running, Timer restores in Paused state.
- Timer does not accumulate time while page is not visible.

---

# 11. UI Integrity Requirements

- Settings overlay blocks background interaction
- Bottom sheet blocks background interaction
- No console errors
- No loading freeze
- No broken sprites after reset
- No incorrect counter states
- No accidental feature regressions

---

# 12. Version Control Rule

Any new feature must:
1. Be added to this CONTRACT.md file
2. Be implemented in code
3. Be verified against this contract before release