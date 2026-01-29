# Frontend - Tower Wagon Driver Management System

React + Vite frontend for the Tower Wagon Driver Management System.

## Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for required configuration.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Axios
- SweetAlert2
- Lucide React (icons)
- react-pdf-viewer (PDF display)

## Project Structure

```
src/
├── api/          # Axios instance
├── components/   # Shared components
├── context/      # React context providers
├── pages/        # Route components
├── App.jsx       # Route definitions
├── main.jsx      # Entry point
└── index.css     # Global styles
```

For full documentation, see the main [README.md](../README.md).

