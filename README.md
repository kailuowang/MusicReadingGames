# Level up your sight-reading with Music Reading Game—100 % free, ad-free, and seriously fun.

## [Play It Here!](https://kailuowang.github.io/MusicReadingGames/)

## Features

* Note reading game with progressive difficulty levels
* Piano keyboard interface for note selection
* Visual feedback for correct/incorrect answers
* Sound feedback - synthesized piano sounds for correct answers, thud sound for incorrect ones
* Tracking of progress and performance
* Level progression based on streaks and speed
* Multiple user profiles

## Game Mechanics

The game presents music notes on a staff and asks the player to identify them by clicking the correct piano key. The difficulty increases progressively with new notes being introduced as the player demonstrates mastery of the current level.

## Audio Implementation

The game uses the Web Audio API to synthesize:
- Piano sounds for correct answers, using the appropriate frequency for each note
- A low "thud" sound for incorrect answers

No external audio files are required, making the game fully self-contained.

## Development & Deployment

### Run Locally
```bash
npm start
```
This will start a local development server at `http://localhost:9000`.

### Deploy to GitHub Pages
To deploy the latest version to the live site:
```bash
npm run deploy
```
This command builds the project and pushes the `dist` folder to the `gh-pages` branch.

## License

MIT 
