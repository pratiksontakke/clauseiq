# ClauseIQ Frontend

A modern, responsive frontend for the ClauseIQ Contract Lifecycle Management platform.

## Tech Stack

- React + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Supabase for backend services
- React Query for data fetching
- React Router for navigation
- Zustand for state management

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd client
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase project credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── auth/      # Authentication components
│   ├── layout/    # Layout components
│   └── ui/        # Basic UI elements
├── pages/         # Page components
├── hooks/         # Custom hooks
├── lib/           # Library configurations
├── styles/        # Global styles
└── utils/         # Utility functions
```

## Color Scheme

- Coral Primary: `#FF385C` (interactive accents)
- Ink Text: `#222222` (body text and icons)
- Cloud Background: `#F7F7F7` (page background)

## Layout Guidelines

- Maximum content width: 1280px
- Vertical rhythm spacing: 24px
- Mobile breakpoint: < 768px
- Tablet breakpoint: < 1024px

## Features

- [x] Authentication (Login, Register, Password Reset)
- [x] Role-based access control
- [x] Contract Dashboard
- [x] Document Viewer
- [x] AI-powered features
- [x] Real-time updates
- [x] Responsive design

## Development Guidelines

1. Use TypeScript for all new components
2. Follow the existing component structure
3. Use Tailwind for styling
4. Add proper error handling
5. Keep components small and focused
6. Write meaningful commit messages

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Private - All rights reserved 