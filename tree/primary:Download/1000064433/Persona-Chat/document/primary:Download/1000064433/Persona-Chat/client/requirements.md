## Packages
framer-motion | Smooth animations for message bubbles and transitions
date-fns | Formatting timestamps in chat
react-textarea-autosize | Auto-growing chat input

## Notes
- Streaming Chat: The endpoint `POST /api/conversations/:id/messages` uses Server-Sent Events (SSE). We must handle the stream manually using `fetch` and `ReadableStream`.
- Auth: `useAuth` is already provided. Redirect unauthenticated users to `/api/login` (via a Login page).
- API: We will match the `api` object structure defined in the routes manifest.
