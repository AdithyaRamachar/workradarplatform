<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- WorkRadar is a frontend-only prototype: all data comes from `src/data/mock.ts` with typed models in `src/lib/types.ts`; no backend, auth, or env vars (per brief).
- App shell (sidebar + top bar) lives in `src/components/workradar/AppShell.tsx` and wraps `<Outlet />` in `__root.tsx`; routing uses TanStack Router (fixed by the stack).

- WorkRadar is a frontend-only prototype: data comes from `src/data/mock.ts` with typed models in `src/lib/types.ts`; no backend, auth, or env vars (per brief).
- The app shell (sidebar + top bar) lives in `src/components/workradar/AppShell.tsx` and wraps `<Outlet />` in `__root.tsx`; routing uses TanStack Router (fixed by the stack).
- Item triage state (assignee, done, snooze) lives in `src/lib/store.tsx` (React context, persisted to localStorage, loaded in useEffect); all routes read items via `useWorkStore()` so changes show everywhere.
- Per-item detail content (evidence, timeline, related, metadata, exposure) lives in `src/data/itemDetails.ts`, keyed by item id; AI text and source observations are labelled separately in the UI.
- Search scoring/highlighting is pure logic in `src/lib/search.ts` (tested); extra non-priority indexed records live in `src/data/searchRecords.ts`.
- Reusable empty/error/recovery states live in `src/components/workradar/states.tsx`; simulated failures carry a SimulatedTag and retries are local timers only.
