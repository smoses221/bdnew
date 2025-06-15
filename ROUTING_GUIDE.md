# Frontend Routing Structure

This project has been restructured to use React Router for clean, modern routing.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── NavigationBar.jsx
│   └── ...
├── pages/              # Page components
│   ├── HomePage.jsx    # Main BD library page
│   ├── AboutPage.jsx   # About us page
│   ├── LoginPage.jsx   # Authentication page
│   ├── AdminPage.jsx   # Admin control panel
│   └── NosActisPage.jsx
|   └── AdminSections/
│       ├── AbonnementsSection.jsx
│       ├── BDsSection.jsx
│       └── LocationsSection.jsx
├── routes/             # Routing configuration
│   ├── AppRoutes.jsx   # Main route definitions
│   └── ProtectedRoute.jsx # Auth guard for protected routes
├── context/            # React Context providers
│   └── UserContext.jsx # User authentication state
└── ...
```

## Routes

| Path | Component | Description | Protection |
|------|-----------|-------------|------------|
| `/` | Redirect to `/bdteque` | Root redirect | Public |
| `/bdteque` | `HomePage` | Main BD library | Public |
| `/nos-actis` | `NosActisPage` | Activities page | Public |
| `/sur-nous` | `AboutPage` | About us | Public |
| `/login` | `LoginPage` | Authentication | Public |
| `/admin` | `AdminPage` | Admin panel | Admin only |

## Features

- **React Router v6** - Modern declarative routing
- **Protected Routes** - Admin routes require authentication and admin privileges
- **Layout Component** - Consistent navigation across all pages
- **Context-based Auth** - Centralized user state management
- **Automatic Redirects** - Seamless navigation after login/logout

## Authentication Flow

1. User navigates to protected route (e.g., `/admin`)
2. `ProtectedRoute` checks authentication status
3. If not authenticated, redirects to `/login` with return path
4. After successful login, user is redirected to original destination
5. Logout redirects to home page (`/bdteque`)

## Navigation

Navigation is handled by the `NavigationBar` component which:
- Uses React Router's `useNavigate` hook
- Highlights current page with `useLocation`
- Integrates with `UserContext` for auth state
- Shows/hides admin menu based on user permissions

## Development

To start the development server:
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5174/` (or next available port).
