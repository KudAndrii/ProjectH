# Project Overview: Nuxt.js Tic-Tac-Toe Game

This project is a Tic-Tac-Toe game built with Nuxt.js, featuring both single-player and multiplayer modes. It leverages WebSockets for real-time communication in multiplayer games and uses a shared codebase for types and core game logic between the client and server.

## Key Technologies

*   **Framework:** Nuxt.js (Vue.js)
*   **UI Library:** Nuxt UI
*   **Real-time Communication:** WebSockets (via Nuxt Nitro's experimental WebSocket feature)
*   **State Management:** Vue `useState` and custom composables
*   **Utilities:** VueUse

## Project Structure and Core Entities

*   **`/` (Root):** Contains main configuration files (`nuxt.config.ts`, `app.config.ts`, `package.json`, `tsconfig.json`).
*   **`assets/css/main.css`:** Global CSS styling.
*   **`components/`:** Reusable Vue components for the game UI (e.g., `TheErrorModal.vue`, `TheGameSettings.vue`, `TheGamingField.vue`, `ThePlayerIcon.vue`, `TheWinnerModal.vue`).
*   **`composables/`:** Vue composables for encapsulating reusable logic and state management.
    *   `use-game-settings.ts`: Manages game configuration.
    *   `use-game-sockets.client.ts`: Handles client-side WebSocket interactions.
    *   `use-game-sockets.server.ts`: Handles server-side WebSocket logic and game session management.
    *   `use-game-state.ts`: Manages the core reactive game state (current player, points, winner).
*   **`layouts/`:** Vue layouts for consistent page structure (`default.vue`).
*   **`pages/`:** Vue pages, representing different routes in the application.
    *   `index.client.vue`: The main game page, orchestrating components, composables, and game logic.
*   **`server/`:** Backend logic for the Nuxt.js server.
    *   `api/ws/games.ts`: The WebSocket API endpoint for game actions (create room, join room, make move, restart, end session).
    *   `plugins/sessions-storage.ts`: Likely handles the storage and retrieval of active game sessions.
*   **`shared/`:** Code shared between the client and server to ensure consistency.
    *   `types/`:** TypeScript type definitions for game entities (e.g., `field-rules.ts`, `game-features.ts`, `game-session.ts`, `game-settings.ts`, `game-state.ts`, `player.ts`, `point.ts`). These are critical for maintaining data structure consistency.
    *   `utils/`:** Utility functions for core game logic and common operations (e.g., `constants.ts`, `define-winner.ts`, `generate-code.ts`, `make-move.ts`).

## Dependencies and Interactions

*   **Client-Server Communication:** The client (`pages/index.client.vue` and `composables/use-game-sockets.client.ts`) communicates with the server (`server/api/ws/games.ts` and `composables/use-game-sockets.server.ts`) primarily via WebSockets for real-time game updates.
*   **Shared Logic:** Both client and server rely heavily on the types defined in `shared/types/` and the game logic utilities in `shared/utils/` (e.g., `make-move.ts` for calculating game outcomes).
*   **UI Composition:** The main game page (`pages/index.client.vue`) composes various UI components from `components/` and leverages state and logic from `composables/`.
*   **Game State Flow:** User actions on the client trigger updates to the game state via composables. In multiplayer, these actions are sent to the server via WebSockets, which then processes the move using shared logic and broadcasts updates back to all connected clients.

## How to Run the Project

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Development Server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:3000`.
3.  **Development Server (HTTPS):**
    ```bash
    npm run dev-https
    ```
    This command starts the development server with HTTPS, requiring `devcert.pem` and `devcert.key` files.
4.  **Build for Production:**
    ```bash
    npm run build
    ```
5.  **Generate Static Site (if applicable):**
    ```bash
    npm run generate
    ```
6.  **Preview Production Build:**
    ```bash
    npm run preview
    ```

## Common Development Tasks

*   **Adding a new UI component:** Create a new `.vue` file in `components/` and import it into the relevant page or component.
*   **Modifying game logic:** Adjust functions in `shared/utils/` (e.g., `make-move.ts`, `define-winner.ts`). Ensure type consistency with `shared/types/`.
*   **Extending game state:** Update `shared/types/game-state.ts` and modify `composables/use-game-state.ts` accordingly.
*   **Adding new WebSocket actions:** Define the action in `composables/use-game-sockets.client.ts` and `use-game-sockets.server.ts`, and handle it in `server/api/ws/games.ts`.

This `GEMINI.md` file should provide a solid foundation for our future interactions, allowing me to quickly understand the context of your requests.

## Gemini Added Memories
- there's an environment where the current project published → https://projecth-jvqr.onrender.com
