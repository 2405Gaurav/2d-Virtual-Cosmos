# 🌌 Virtual Cosmos

A **2D virtual space** where users can move around, explore zones, and chat with nearby people in real-time. Think of it as a spatial chat app — you walk around a cosmos-themed world and when you get close to someone, a proximity-based group chat opens up automatically.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![PixiJS](https://img.shields.io/badge/PixiJS-E91E63?style=flat&logo=pixijs&logoColor=white)

---

> ### ⚠️ 🏗️ Important — Backend Cold Start
> The backend is hosted on **Render's free tier**, which spins down after periods of inactivity. Your **first join / user creation may take 30–60 seconds** while the server wakes up. Once it's running, all subsequent connections and actions will be fast. Just be patient on that first load!

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Architecture](#architecture)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Real-Time Communication](#real-time-communication)
- [How It Works](#how-it-works)
  - [Movement System](#movement-system)
  - [Proximity Detection](#proximity-detection)
  - [Chat System](#chat-system)
  - [User Profiles](#user-profiles)
  - [Camera & Zoom](#camera--zoom)
- [Canvas Rendering](#canvas-rendering)
- [State Management](#state-management)
- [Database Schema](#database-schema)
- [Socket Events Reference](#socket-events-reference)
- [License](#license)

---

## Overview

Virtual Cosmos is a full-stack real-time application that simulates a 2D virtual world. Users enter the cosmos by choosing a username, then they can navigate around a large world map using keyboard controls (WASD or arrow keys). The world has themed zones (Full Stack Developers, TuteDude HQ, UI/UX Design Lab) where users can gather.

The core mechanic is **proximity-based communication** — when two or more users get within 150 pixels of each other, a chat panel automatically opens and they can exchange messages in real-time. Move away, and the chat closes. Its essentially a spatial social experience.

---

## Features

### Core
- 🚀 **Real-time multiplayer** — see other users move around the world live
- 💬 **Proximity chat** — chat opens automatically when users are nearby
- 🎮 **Smooth movement** — frame-rate independent keyboard controls (WASD / Arrow keys)
- 🔍 **Zoom & pan** — scroll to zoom, right-click drag to pan the camera
- 🗺️ **Themed zones** — labeled areas on the map for users to gather in

### User Experience
- 🎭 **Customizable avatars** — pick from 20 emoji icons
- 📝 **User bios** — set a short bio that others see on hover
- ✍️ **Typing indicators** — see when nearby users are typing
- 🏷️ **Name tags** — every user has a floating name label
- 💫 **Proximity rings** — visual indicator showing your chat range

### Visual
- ✨ **Animated landing page** — Three.js shader-based magic rings effect
- 🌟 **Star field background** — multi-layered parallax stars
- 🌈 **Nebula clouds** — colorful gas cloud decorations across the map
- 📐 **HUD grid** — subtle grid overlay with intersection dots
- 🎯 **Proximity lines** — green lines connecting you to nearby users
- 🔄 **Smooth camera** — lerped camera following with zoom support

### Technical
- 📦 **Persistent data** — user profiles and positions saved to MongoDB
- 🔄 **Message TTL** — chat messages auto-expire after 24 hours
- 🛡️ **Input sanitization** — server-side validation for profiles and messages
- 📡 **Throttled network** — movement updates throttled to ~20/sec to reduce bandwidth
- 🎯 **TypeScript everywhere** — fully typed frontend and backend

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **PixiJS 8** | 2D canvas rendering (world, stars, grid, zones) |
| **Three.js** | WebGL shader effects (landing page rings) |
| **Zustand** | Global state management |
| **Socket.IO Client** | Real-time WebSocket communication |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Shadcn/UI** | UI component primitives |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express 5** | HTTP server |
| **TypeScript** | Type safety |
| **Socket.IO** | WebSocket server |
| **MongoDB + Mongoose 9** | Database & ODM |
| **dotenv** | Environment variable management |
| **Render** | Hosting (free tier — see cold start note above) |

---

## Project Structure

```
virtual-cosmos/
├── README.md
├── .gitignore
│
├── frontend/                    # React + Vite frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── .env                     # VITE_SERVER_URL
│   └── src/
│       ├── main.tsx             # Entry point, route setup
│       ├── App.tsx              # Landing → Join flow
│       ├── index.css            # Tailwind + theme variables
│       │
│       ├── pages/
│       │   └── CosmosServer.tsx # Main game page (canvas + UI)
│       │
│       ├── components/
│       │   ├── MagicRings.tsx   # Three.js shader ring effect
│       │   ├── MagicRings.css
│       │   │
│       │   ├── Chat/
│       │   │   └── ChatPanel.tsx    # Proximity chat UI
│       │   │
│       │   ├── canvas/
│       │   │   ├── CosmosCanvas.tsx  # PixiJS canvas + camera + ticker
│       │   │   ├── AvatarLayer.tsx   # DOM overlay for user avatars
│       │   │   ├── UserAvatar.tsx    # Individual avatar component
│       │   │   ├── IconPicker.tsx    # Avatar & bio editor
│       │   │   └── layers/
│       │   │       ├── BackgroundLayer.ts   # Stars + nebula
│       │   │       ├── GridLayer.ts         # HUD grid
│       │   │       ├── ZoneLayer.ts         # Themed zones
│       │   │       └── ProximityLineLayer.ts # Lines to nearby users
│       │   │
│       │   └── ui/
│       │       ├── LandingPage.tsx   # Hero landing screen
│       │       ├── JoinScreen.tsx    # Username entry
│       │       ├── ZoomControls.tsx  # +/- zoom buttons
│       │       └── button.tsx        # Shadcn button primitive
│       │
│       ├── hooks/
│       │   ├── useSocket.ts     # Socket.IO connection & event handlers
│       │   └── useMovement.ts   # Keyboard movement with physics
│       │
│       ├── store/
│       │   ├── useCosmosStore.ts   # Main app state (users, chat, etc)
│       │   └── useCameraStore.ts   # Camera position & zoom state
│       │
│       ├── lib/
│       │   └── utils.ts         # Tailwind cn() utility
│       │
│       └── assets/
│
└── server/                      # Node.js + Express backend
    ├── package.json
    ├── tsconfig.json
    ├── .env                     # PORT, MONGODB_URI, CLIENT_URL
    └── src/
        ├── server.ts            # Entry point, starts HTTP + Socket.IO
        ├── app.ts               # Express app setup
        │
        ├── config/
        │   ├── env.ts           # Environment variable validation
        │   └── database.ts      # MongoDB connection
        │
        ├── middleware/
        │   └── cors.ts          # CORS configuration
        │
        ├── models/
        │   ├── User.ts          # Mongoose User schema
        │   └── Message.ts       # Mongoose Message schema (TTL index)
        │
        ├── repository/
        │   ├── userRepository.ts    # User DB operations
        │   └── messageRepository.ts # Message DB operations
        │
        ├── services/
        │   ├── DatabaseService.ts   # Business logic for DB operations
        │   └── ProximityService.ts  # Distance calculations & room management
        │
        ├── socket/
        │   └── handlers.ts      # All Socket.IO event handlers
        │
        ├── types/
        │   └── index.ts         # Shared TypeScript interfaces
        │
        ├── controllers/         # (empty, future REST endpoints)
        ├── routes/              # (empty, future REST routes)
        └── utils/               # (empty, future utilities)
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** — either a local instance or a cloud-hosted cluster (e.g., MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/virtual-cosmos.git
   cd virtual-cosmos
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install server dependencies:**
   ```bash
   cd ../server
   npm install
   ```

### Environment Variables

#### Frontend (`frontend/.env`)
```env
VITE_SERVER_URL=http://localhost:3001
```

#### Server (`server/.env`)
```env
PORT=3001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/virtual-cosmos
CLIENT_URL=http://localhost:5173
```

> **Note:** The `CLIENT_URL` should match the URL where the Vite dev server runs (default `http://localhost:5173`). This is used for CORS configuration.

### Running the App

You need two terminals — one for the frontend, one for the backend.

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```
This starts the server with `tsx watch` for hot-reloading on port 3001.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
This starts the Vite dev server on port 5173.

**Open the app:**
Navigate to `http://localhost:5173` in your browser. Open multiple tabs/browsers to test multiplayer.

### Build for Production

```bash
# Frontend
cd frontend
npm run build        # outputs to dist/

# Backend
cd server
npm run build        # compiles TypeScript to dist/
npm start            # runs compiled JS
```

---

## Architecture

### Frontend Architecture

The frontend follows a layered rendering approach:

```
┌──────────────────────────────────┐
│         CosmosServer Page        │
├──────────────────────────────────┤
│  Layer 1: PixiJS Canvas         │  ← Stars, grid, zones, proximity lines
│  (CosmosCanvas.tsx)              │
├──────────────────────────────────┤
│  Layer 2: DOM Avatar Overlay     │  ← User avatars, names, tooltips
│  (AvatarLayer.tsx)               │
├──────────────────────────────────┤
│  Layer 3: UI Controls            │  ← Chat panel, icon picker, zoom
│  (ChatPanel, IconPicker, etc.)   │
└──────────────────────────────────┘
```

The PixiJS canvas handles the heavy rendering (background, stars, grid, zones) while DOM overlays are used for user avatars and UI elements. This hybrid approach gives us the performance of canvas rendering with the flexibility of DOM for interactive UI.

### Backend Architecture

The server follows a layered architecture pattern:

```
Socket Handlers  →  Services  →  Repository  →  Mongoose Models  →  MongoDB
```

- **Handlers** (`socket/handlers.ts`) — receive socket events, orchestrate business logic
- **Services** (`services/`) — business logic (proximity calculation, DB operations)
- **Repository** (`repository/`) — direct database queries
- **Models** (`models/`) — Mongoose schema definitions

### Real-Time Communication

All real-time features use **Socket.IO** WebSockets:

```
Frontend (React)  ←──Socket.IO──→  Backend (Node.js)
     ↓                                    ↓
  Zustand Store                     Active Users Map
  (client state)                   (server state)
```

The server maintains an in-memory `Map<string, UserState>` of all active users. When a user moves, the server recalculates proximity and broadcasts updates to affected users.

---

## How It Works

### Movement System

The movement system (`useMovement.ts`) uses a **requestAnimationFrame** game loop:

1. **Keyboard input** — tracks pressed keys via `keydown`/`keyup` events
2. **Frame-rate independent** — movement distance = `SPEED × deltaTime` (not tied to FPS)
3. **Instant local update** — position updates locally immediately for smooth feel
4. **Throttled network sync** — socket emissions capped at ~20/sec (every 50ms) to reduce bandwidth
5. **World bounds** — player position clamped to `0..6200` (x) and `0..1200` (y)

### Proximity Detection

The `ProximityService` runs on every movement event:

1. Calculate distance between the moving user and all other active users
2. Anyone within **150 pixels** is considered "nearby"
3. Compare with previous nearby list — only emit updates if changed
4. Manage Socket.IO rooms for chat routing
5. Notify all affected users of their updated nearby list

### Chat System

Chat is proximity-based and group-oriented:

1. When users are nearby, `proximity:update` opens the `ChatPanel` automatically
2. Messages are sent to all nearby users directly (not via rooms, for simplicity)
3. Typing indicators show bouncing dots when someone is typing
4. Messages are persisted to MongoDB with a 24-hour TTL index
5. Moving away from users closes the chat

### User Profiles

Each user has:
- **Username** — chosen on the join screen (max 20 chars)
- **Icon** — emoji avatar chosen from IconPicker (20 options)
- **Bio** — short text (max 120 chars) visible on hover tooltip
- **Color** — randomly assigned from a palette of 6 colors

Profiles are persisted to MongoDB. When a user reconnects with the same username, their previous profile, position, and color are restored.

### Camera & Zoom

The camera system (`CosmosCanvas.tsx` ticker loop):

1. **Auto-follow** — camera smoothly follows the player using exponential lerp
2. **Zoom** — mouse wheel to zoom (0.3x to 2.0x), stored in Zustand so the zoom buttons & canvas stay in sync
3. **Pan** — right-click or middle-click drag to offset the camera
4. **Auto-recenter** — pan offset gradually resets to zero when the player moves with WASD
5. **DOM sync** — camera position broadcast to `useCameraStore` so DOM avatars align with the canvas

---

## Canvas Rendering

The PixiJS canvas renders four layers (in order):

| Layer | File | What it Renders |
|---|---|---|
| **Background** | `BackgroundLayer.ts` | Deep space gradient + 3-tier star field (800 tiny + 300 medium + 60 bright with glow) + nebula gas clouds |
| **Grid** | `GridLayer.ts` | Subtle 120px grid lines with dot intersections |
| **Zones** | `ZoneLayer.ts` | Rounded rectangles with fill, border, corner brackets, and emoji labels |
| **Proximity Lines** | `ProximityLineLayer.ts` | Green lines from player to nearby users, alpha fades with distance |

---

## State Management

Two Zustand stores manage all client-side state:

### `useCosmosStore`
| State | Type | Description |
|---|---|---|
| `username` | `string \| null` | Current user's display name |
| `myId` | `string \| null` | Socket.IO connection ID |
| `myPosition` | `{x, y}` | Local player position in world coords |
| `remoteUsers` | `Map<id, RemoteUser>` | All other connected users |
| `nearbyUsers` | `string[]` | IDs of users within proximity radius |
| `chatMessages` | `ChatMessage[]` | All received chat messages |
| `isChatOpen` | `boolean` | Whether the chat panel is visible |
| `icon` | `string` | Current user's emoji avatar |
| `bio` | `string` | Current user's bio text |
| `typingUsers` | `Map<id, name>` | Who is currently typing |
| `socket` | `Socket \| null` | Socket.IO client instance |

### `useCameraStore`
| State | Type | Description |
|---|---|---|
| `offsetX` | `number` | Camera X offset (screen coords) |
| `offsetY` | `number` | Camera Y offset (screen coords) |
| `zoom` | `number` | Current interpolated zoom level |
| `targetZoom` | `number` | Target zoom level (set by wheel/buttons) |

---

## Database Schema

### User Collection
```javascript
{
  username:  String,    // unique, trimmed
  color:     String,    // randomly assigned hex color
  icon:      String,    // emoji avatar (default '👤')
  bio:       String,    // short description (default '')
  lastX:     Number,    // last known X position (default 400)
  lastY:     Number,    // last known Y position (default 300)
  lastSeen:  Date       // last connection timestamp
}
```

### Message Collection
```javascript
{
  senderId:   String,   // socket.id of sender
  senderName: String,   // display name
  text:       String,   // message content
  roomId:     String,   // sorted user IDs joined with '--'
  timestamp:  Date      // auto-set, TTL index (expires after 24h)
}
```

---

## Socket Events Reference

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `user:move` | `{ x, y }` | Player moved to new position |
| `chat:send` | `{ text }` | Send a chat message to nearby users |
| `user:update-profile` | `{ icon, bio }` | Update avatar and bio |
| `chat:typing` | *(none)* | User started typing |
| `chat:stopTyping` | *(none)* | User stopped typing |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `users:init` | `UserState[]` | All currently online users (sent on connect) |
| `user:joined` | `UserState` | A new user connected |
| `user:moved` | `UserState` | Another user changed position |
| `user:left` | `string (id)` | A user disconnected |
| `proximity:update` | `string[] (ids)` | Updated list of nearby user IDs |
| `chat:message` | `ChatMessage` | Incoming chat message |
| `user:profile-updated` | `{ id, icon, bio }` | A user changed their profile |
| `chat:typing` | `{ senderId, senderName }` | Someone nearby started typing |
| `chat:stopTyping` | `{ senderId }` | Someone nearby stopped typing |

---

## License

This project is licensed under the ISC License.

---

**Built by Gaurav** 🚀