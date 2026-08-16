# Portal Reliability Optimization Design

## Goal

Make the portal reliably start with `npm run dev`, prevent silent image failures, and reduce initial JavaScript loading without redesigning the existing UI or changing mock business behavior.

## Confirmed Findings

- Ports 3000 and 3001 are occupied by other Vite processes. Visiting port 3000 showed stale source code and a missing `/src/assets/banner/1.png`, while the current project ran correctly on port 3010.
- The current project mixes root-relative public URLs, document URLs, relative URLs, imported source assets, and remote Unsplash URLs.
- `npm run lint` and `npm run build` pass.
- `npm test` fails because the script references Vitest but Vitest is not installed.
- The production entry chunk is about 941 KB and Vite reports a chunk-size warning.

## Scope

### Asset URLs

Add one small public-asset URL helper based on `import.meta.env.BASE_URL`. Use it for images, video, authentication assets, and document downloads stored under `public`. Keep source-owned logo imports as module imports so Vite continues to fingerprint them.

The helper will normalize leading slashes and optional `public/` prefixes. This protects the code from paths commonly produced by code-generation tools while preserving development behavior.

### Image Failure Handling

Add a reusable image fallback utility or component only where it removes repeated error handling. Local display-critical images will fall back to an existing local asset. Remote images will retain their current content where they load, but receive a local fallback so an unavailable external service does not leave a broken image.

### Tests

Install Vitest as a development dependency. Add focused tests for public-asset URL normalization and fallback behavior that can be tested without a browser. Tests must first reproduce the current unsupported path variants before implementation.

### Loading Performance

Convert route-level page imports in `App.tsx` to `React.lazy` and wrap routes in a single accessible loading boundary. Shared providers and the primary layout remain eager. This reduces the initial entry chunk without changing route URLs or page behavior.

Add native lazy loading to non-critical content images where doing so does not affect the hero or immediately visible architecture content.

## Out Of Scope

- Visual redesign or copy changes.
- Downloading and redistributing all Unsplash assets.
- Changing authentication, mock data behavior, routing URLs, or API contracts.
- Stopping unrelated Vite processes owned by the user.

## Error Handling

- Invalid or empty asset paths resolve to the configured base URL instead of producing double slashes or malformed URLs.
- Failed content images switch once to a known local fallback and do not loop if the fallback itself fails.
- Route chunk loading uses the existing app surface with a minimal loading state.

## Verification

Run `npm test`, `npm run lint`, and `npm run build`. Start the project on an available port, inspect all rendered image elements for zero natural width, inspect browser console errors, and verify representative routes including home, login, products, ecology, and documents.
