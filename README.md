<!-- PROJECT LOGO -->

<h1 align="center">SyncGrid</h1>

<p align="center">
  <b>Real-time collaborative workspace platform</b><br>
  <i>Kanban boards, collaborative editing, notifications, and more.</i>
</p>

<p align="center">
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

# SyncGrid

SyncGrid is a real-time collaborative workspace platform built with Next.js, Supabase, Liveblocks, and a modern React/TypeScript stack. It features Kanban boards, collaborative editing, notifications, and more.

---

## 🚀 Tech Stack

- **Next.js**: React framework for server-side rendering, routing, and API routes.
- **TypeScript**: Type-safe JavaScript for robust code.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Supabase**: Backend-as-a-Service for authentication, database, and real-time features.
- **Dnd-kit**: Drag-and-drop for Kanban boards.
- **Tiptap**: Rich text collaborative editor.
- **Zustand**: State management for React.
- **Lucide-react**: Icon library.
- **React Hot Toast**: Toast notifications.
- **Radix UI**: Accessible UI primitives.
- **Framer Motion**: Animations.

---

## ✨ Features

- 🔐 User authentication (sign up, login, email verification)
- 🗂️ Real-time Kanban board with drag-and-drop
- 🤝 Collaborative editing with presence indicators
- 📁 Project and board management
- 🔔 Notification system
- 📱 Responsive, modern UI

---

## 🛠️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/syncgrid.git
   cd syncgrid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your Supabase credentials and other required values.

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## 📁 Project Structure

- `app/` — Next.js app directory (routes, pages)
- `components/` — Reusable UI and board components
- `lib/` — Hooks, utilities, and API clients
- `types/` — TypeScript types

---

## 🗄️ Database

- Uses Supabase (PostgreSQL) for data storage, authentication, and real-time features.
- SQL scripts for schema and RLS policies are in the `sql/` directory.

---

## 🤝 Contributing

We welcome contributions! To get started:

1. **Fork the repository** and create your branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** and commit:
   ```bash
   git commit -m "Add your feature"
   ```

3. **Push to your fork** and open a Pull Request:
   ```bash
   git push origin feature/your-feature
   ```

4. **Describe your changes** in the PR and link any related issues.

### Guidelines

- Use clear, descriptive commit messages.
- Write type-safe, clean, and well-documented code.
- Follow the existing code style (TypeScript, Tailwind, etc.).
- Add tests or documentation as needed.
- For major changes, open an issue first to discuss your proposal.

---

## 📜 License

[MIT](LICENSE)

---

<p align="center">
  <img src="public/next.svg" alt="Next.js" width="40" />
  <img src="public/vercel.svg" alt="Vercel" width="40" />
  <img src="public/window.svg" alt="UI" width="40" />
</p>
