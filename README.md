# Tic-Tac-Toe Multiplayer Game

A real-time multiplayer Tic-Tac-Toe game built with Nuxt 3, Vue 3, and WebSockets. Play with friends in custom-sized game boards with real-time updates and session management.

## Features

- **Real-time Multiplayer**: Play with friends online using WebSockets
- **Custom Game Rules**: Configure field size and winning conditions
- **Room Management**: Create and join game rooms with unique session IDs
- **Session Control**: Restart games or end sessions as needed
- **Responsive UI**: Built with Nuxt UI components for a modern look and feel

## Technology Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (v3.17.2)
- **UI Framework**: [Vue 3](https://vuejs.org/) (v3.5.13)
- **UI Components**: [@nuxt/ui](https://ui.nuxt.com/) (v3.1.1)
- **Routing**: [Vue Router](https://router.vuejs.org/) (v4.5.1)
- **Icons**: [@nuxt/icon](https://github.com/nuxt/icon) (v1.12.0) with Material Symbols
- **Utilities**: [@vueuse/nuxt](https://vueuse.org/nuxt/readme.html) (v13.1.0)
- **WebSockets**: Built-in Nuxt WebSocket handler

## Game Mechanics

The game implements classic Tic-Tac-Toe rules with customizable field sizes:

- Players take turns placing their marks (X or O) on the board
- The first player to get a specified number of marks in a row (horizontally, vertically, or diagonally) wins
- If all cells are filled without a winner, the game ends in a draw
- Players can restart the game without creating a new room

## Project Structure

- `/server` - WebSocket server implementation
- `/composables` - Shared logic and WebSocket client/server handlers
- `/shared` - Type definitions and shared utilities
- `/components` - Reusable Vue components
- `/pages` - Application routes and pages
- `/layouts` - Page layouts
- `/assets` - Static assets like styles and images
- `/public` - Publicly accessible files


## WebSocket API

The game uses a WebSocket API with the following actions:

- `create-room` - Create a new game room with custom rules
- `join-room` - Join an existing room by session ID
- `make-move` - Make a move on the game board
- `restart` - Restart the current game
- `end-session` - End the current game session
