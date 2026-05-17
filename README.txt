SSN Overlay - Setup Instructions
================================

What this is: a transparent, always-on-top overlay that puts your Social
Stream Ninja chat and activity feed on top of any borderless-fullscreen
game. Built for sim racing, rhythm games, etc. where your eyes have to
stay on the main monitor and OBS docks aren't visible.


FIRST-TIME SETUP
----------------

1. Open config.json in Notepad (right-click -> Open with -> Notepad).

2. Fill in your values:

   "session": "..."
       Your SSN session ID. Find it on socialstream.ninja or in the SSN
       desktop app dashboard. Looks like a short random code, e.g. "aB3xY7Q".

   "twitchChannel": "..."
       Your Twitch username, ALL LOWERCASE. Used for the gold-dot marker
       on messages that come from a collab partner's channel via Twitch
       Shared Chat. Harmless to leave blank if you don't collab.

   "streamElementsJwt": "..."
       OPTIONAL. Only fill this in if you use StreamElements for donations
       and want them to appear in the activity feed. Find at:
       StreamElements dashboard -> profile name -> Channels tab ->
       Show secrets -> JWT Token. Leave as "" if you don't use SE.

3. Save the file.


RUNNING THE OVERLAY
-------------------

1. Make sure Social Stream Ninja is running (the desktop app, NOT just
   the website). The overlay needs SSN to forward chat to it.

2. Double-click "SSN Overlay.exe".

3. Two transparent windows appear on top of everything: chat (left) and
   activity feed (below chat). They're click-through by default so they
   don't block your game.


HOTKEYS (global - work even when the game has focus)
-----------------------------------------------------

   Ctrl+Shift+O    Toggle EDIT MODE - drag to move, edges to resize the
                   overlay windows. Press again to lock them.

   Ctrl+Shift+H    Hide / show the overlay.

   Ctrl+Shift+Q    Quit the app.

Window positions are saved automatically when you drag them, so you only
need to set them up once.


IMPORTANT REQUIREMENTS
----------------------

* The game you're playing must run in BORDERLESS WINDOWED mode.
  Exclusive fullscreen mode blocks anything on top of the game window,
  including this overlay. Most games have this option in graphics
  settings - look for "Borderless Windowed" or "Windowed Fullscreen".

* Social Stream Ninja must be running and capturing your chat.


WINDOWS SECURITY WARNING ON FIRST LAUNCH
----------------------------------------

The first time you run SSN Overlay.exe, Windows may show a blue dialog
saying "Windows protected your PC" or "Microsoft Defender SmartScreen
prevented an unrecognized app from starting."

Click "More info", then click "Run anyway".

This is because the app isn't code-signed. A signing certificate costs
about $300/year and isn't worth it for a free tool. The source code is
public if you want to verify it does what it says:
https://github.com/thepolishdane/ssn-desktop-overlay


TROUBLESHOOTING
---------------

Overlay appears but no chat messages show up:
  - Confirm SSN is running and has at least one platform connected
  - Confirm your session ID in config.json matches SSN's current session
  - Press Ctrl+Shift+Q, edit config.json, relaunch

Overlay doesn't appear on top of game:
  - Switch the game to borderless windowed mode

Want to reposition or resize:
  - Press Ctrl+Shift+O to enter edit mode, drag the windows, press
    Ctrl+Shift+O again to lock

Want to start fresh:
  - Delete bounds.json (regenerates on next launch with default positions)


Made by thepolishdane.
Source: https://github.com/thepolishdane/ssn-desktop-overlay
Themes:  https://github.com/thepolishdane/stream-overlays
