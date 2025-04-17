It'a an simple Html + Typescript app for music reading. 
All game meta data should be stored separately from code so that they can be easily editted.
The game logic should have unit test coverage


* [x] Note Read Game - a game where player can select the correct note displayed in the sheet to score. 
   * [x] Display the options as a piano keyboard, each key with the note name on it (which can be hidden as well).  The keyboard should be display differently for treble cleff and base cleff to accomodate all the notes in that cleff.
   * [x]  Multile levels. starting with the 4 space notes F, A, C, E on treble clef
   * [x] It can be assumed that the user has learned all the notes up to this level, so we have a set of learned notes, starting from level 2, each new level should be just 1 new note, but it not try to add any base cleff notes before all the treble cleffs are learned. In this new level, the app should randomly pick a note from the learned notes set and randomly ask this new note at a roughly 20% frequency. 
   * [x] The user level up when they achieve a streak with faster than a certain speed. 

   * [x]  If user has been mistaken about a specific note, the note should be asked more frequently until the user can consistent get it right
   * [x]  The user's progress should be stored in the cookie so that she can resume later
   

