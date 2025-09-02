# Trading Dashboard Frontend (ws_ai_front)

Trading Dashboard is a modern React 18 TypeScript application for cryptocurrency trading analysis. It's a single-page application (SPA) using React Router 6, built with Vite, and styled with TailwindCSS 3 and Radix UI components.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository:
- **Node.js Requirements**: Node.js v20+ and npm v10+ (tested with Node.js v20.19.4, npm v10.8.2)
- **Install Dependencies**: `npm install` -- takes ~35 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
- **Build Application**: `npm run build` -- takes ~6 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Runs TypeScript compilation (`tsc --noEmit`) and Vite build
  - Creates optimized production build in `dist/` directory
  - Bundle size: ~587KB JavaScript, ~90KB CSS
- **Type Check**: `npm run type-check` -- takes ~1 second. Validates TypeScript without emitting files.
- **Run Tests**: `npx vitest run` -- takes ~1.2 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
  - Uses Vitest framework (compatible with Jest API)
  - Currently has 1 test file: `src/lib/utils.spec.ts` (5 tests for `cn` utility function)
  - Vitest must be installed: `npm install --save-dev vitest` if not present

### Run the Application:
- **Development Server**: `npm run dev` -- starts in ~264ms on http://localhost:8080. NEVER CANCEL.
  - Runs with host `0.0.0.0` and port `8080`
  - Hot Module Replacement (HMR) enabled
  - Proxy configured: `/api` requests proxy to `http://localhost:8100`
- **Production Preview**: `npm run preview` -- serves built application on http://localhost:4173

### Known Issues and Limitations:
- **ESLint Configuration Missing**: `npm run lint` fails due to missing `eslint.config.js`. ESLint v9+ requires new config format.
- **Backend Dependency**: Application expects backend API on localhost:8100. Without backend:
  - API calls return 500 errors (expected behavior)
  - WebSocket connections fail (expected behavior)
  - Frontend functionality remains intact for testing UI changes
- **No CI/CD Pipeline**: No `.github/workflows/` directory found - application has no automated CI/CD

## Validation

### Manual Validation Requirements:
- **ALWAYS** manually validate any UI changes by running the development server and taking screenshots
- **ALWAYS** test complete user scenarios after making changes:
  1. Start dev server: `npm run dev`
  2. Navigate to http://localhost:8080
  3. Test navigation between pages: Home (/) → Database (/database) → Coin Management (/coin-management)
  4. Verify responsive layout and theme switching functionality
  5. Check browser console for new errors (ignore expected API/WebSocket errors)
  6. Take screenshot to document changes

### Pre-commit Validation:
- Always run `npm run type-check` before committing - this is the only working linter
- Always run `npm run build` to ensure production build succeeds
- Always run `npx vitest run` to ensure tests pass
- ESLint currently broken - do not run `npm run lint`

## Architecture and Navigation

### Directory Structure:
```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Radix UI + custom components (67 components)
│   ├── ChartView.jsx  # Main trading chart component
│   ├── MarketTrades.jsx
│   └── OrderBook.jsx
├── pages/             # Route components (10 pages)
│   ├── Index.tsx      # Home page with trading interface
│   ├── Database.tsx   # Database management
│   ├── CoinManagement.tsx
│   ├── AI.tsx, ML.tsx, News.tsx, etc.
│   └── NotFound.tsx   # 404 page
├── lib/
│   ├── utils.ts       # cn() utility for className merging
│   └── utils.spec.ts  # Tests for utilities
├── api/               # API client functions
├── context/           # React context providers
├── hooks/             # Custom React hooks
├── utils/             # General utilities
└── main.tsx          # Application entry point
```

### Routing System:
- Uses React Router 6 with `BrowserRouter`
- Routes defined in `src/App.tsx`
- All routes above catch-all `*` route that renders `NotFound`
- Navigation component: `src/components/ui/trading-nav.tsx`

### Styling System:
- **TailwindCSS 3**: Primary styling method
- **Radix UI**: Accessible component primitives
- **Class Variance Authority**: Component variants
- **cn() Utility**: Combines `clsx` and `tailwind-merge` for conditional classes
- **Theme Support**: Dark/light mode via `next-themes`
- **Custom Components**: Comprehensive UI library in `src/components/ui/`

### Key Technologies:
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **TanStack Query**: Data fetching and caching
- **React Hook Form**: Form handling
- **Recharts**: Chart components
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls

## Common Commands Reference

### Frequently Used Commands:
```bash
# Development workflow
npm install          # ~35 seconds
npm run dev         # Start dev server (~264ms)
npm run build       # Build for production (~6 seconds)
npm run type-check  # TypeScript validation (~1 second)
npx vitest run      # Run tests (~1.2 seconds)

# File operations
ls -la src/pages/                    # List all route components
find src/components/ui -name "*.tsx" # List all UI components
cat src/App.tsx                     # View routing configuration
```

### Package.json Scripts:
```json
{
  "dev": "vite --host 0.0.0.0 --port 8080",
  "build": "tsc --noEmit && vite build", 
  "lint": "eslint .",                     // ⚠️ BROKEN - missing config
  "preview": "vite preview",
  "type-check": "tsc --noEmit"
}
```

### Key Configuration Files:
- `vite.config.ts`: Build configuration, dev server, path aliases
- `tailwind.config.ts`: Design system tokens and theme configuration  
- `tsconfig.json`: TypeScript configuration
- `package.json`: Dependencies and scripts
- `components.json`: UI component configuration

## Testing and Quality Assurance

### Current Test Infrastructure:
- **Framework**: Vitest (Jest-compatible API)
- **Test Files**: `src/lib/utils.spec.ts` only
- **Coverage**: Utility functions only
- **Runtime**: ~1.2 seconds for full test suite

### Adding New Tests:
- Place tests in same directory as source with `.spec.ts` suffix
- Follow existing pattern in `src/lib/utils.spec.ts`
- Use `describe`, `it`, `expect` from `vitest`
- Run with `npx vitest run` or `npx vitest` for watch mode

### Quality Checklist:
- [ ] Type checking passes (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)  
- [ ] Tests pass (`npx vitest run`)
- [ ] Manual UI testing completed
- [ ] Screenshot taken for UI changes
- [ ] Browser console checked for new errors

## Development Tips

### Making Changes:
- Always start dev server first to see changes live
- Use browser DevTools to inspect component structure
- Check browser console for errors (ignore expected backend errors)
- Test theme switching and responsive design
- Validate routing works for all pages

### Common File Locations:
- **Add new pages**: `src/pages/` + update routes in `src/App.tsx`
- **Add UI components**: `src/components/ui/`
- **Modify main layout**: `src/App.tsx`
- **Update styling**: `tailwind.config.ts` for design tokens
- **API integration**: `src/api/` directory
- **Utility functions**: `src/lib/utils.ts`

### Performance Notes:
- Bundle is large (~587KB) - consider code splitting for new features
- Build warns about chunk size - use dynamic imports for large components
- Development server is very fast (~264ms startup)
- Hot reload works well for all file types

## Troubleshooting

### Common Issues:
1. **ESLint errors**: Configuration missing - use `npm run type-check` instead
2. **API errors**: Expected when backend not running - frontend works independently  
3. **WebSocket failures**: Expected without backend - does not affect UI testing
4. **Build warnings**: Large chunks are known issue - application works correctly

### Recovery Steps:
```bash
# Reset node_modules if needed
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev

# Verify installation
npm run type-check && npm run build && npx vitest run
```