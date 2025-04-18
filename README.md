# Music Reading Game

A simple HTML + TypeScript application for learning how to read sheet music.

## Features

- Note identification game with multiple levels
- Progressive difficulty starting with treble clef spaces (F, A, C, E)
- Adaptive difficulty that increases frequency of problematic notes
- Progress tracking with local storage
- Support for both treble and bass clefs

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```

### Development

Run the development server:
```
npm start
```

The game will be available at http://localhost:9000

### Testing

The project uses Jest for testing. To run all tests:

```
npm test
```

To run a specific test file:

```
npm test -- path/to/test-file.test.ts
```

The test suite includes unit tests for game components, note handling, storage, and rendering.

### Build

To build the production version:
```
npm run build
```

### Deployment

The game can be easily deployed to GitHub Pages:

1. If you haven't already, install the gh-pages package:
```
npm install gh-pages --save-dev
```

2. Make sure your package.json has the following scripts:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy to GitHub Pages:
```
npm run deploy
```

4. Your game will be published to https://[your-username].github.io/[repository-name]/

## Game Structure

The game has the following levels:

1. Treble Clef Spaces (F, A, C, E)
2. Treble Clef Lines (E, G, B, D, F)
3. All Treble Clef Notes
4. Bass Clef Spaces (A, C, E, G)
5. Bass Clef Lines (G, B, D, F, A)
6. All Bass Clef Notes
7. Master Level (All notes from both clefs)

Each level adapts to the player's performance, showing more frequently the notes that the player struggles with.

## Live Demo

Try the game at: https://kailuowang.github.io/MusicReadingGames/

## License

This project is open source and available under the MIT License. 