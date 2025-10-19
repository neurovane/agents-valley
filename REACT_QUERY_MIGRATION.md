# React Query Migration Progress

## ✅ Completed

### 1. Setup (100%)
- ✅ Installed @tanstack/react-query + devtools
- ✅ Created QueryProvider with optimal config
- ✅ Wrapped app in QueryClientProvider

### 2. Hooks Created (100%)
- ✅ `useAgents` - fetch/search/upvote agents
- ✅ `useMCPServers` - fetch/search/upvote MCP servers
- ✅ `useEvents` - fetch events/register
- ✅ `useComments` - fetch/add comments (agent & MCP)

### 3. Pages Migrated (40%)
- ✅ Homepage (`/`) - Using `useAgents`, `useMCPServers`, `useEvents`
- ✅ Agents listing (`/agents`) - Using `useAgents` with client-side filtering
- ✅ Agent details (`/agents/[id]`) - Using `useAgent`, `useAgentComments`, `useAgentUpvoteStatus`, `useUpvoteAgent`, `useAddComment`

## 🔄 Remaining Work

### Pages to Migrate

#### 1. MCP Servers (`/mcp-servers/page.tsx`)
```typescript
// Replace useAuthStableData with:
const { data: mcpServers, isLoading, error } = useMCPServers({
  sortBy,
  category: selectedCategory,
})
```

#### 2. Events Listing (`/events/page.tsx`)
```typescript
// Replace useAuthStableData with:
const { data: events, isLoading, error } = useEvents({
  sortBy,
  eventType,
  category: selectedCategory,
})
```

#### 3. Event Details (`/events/[id]/page.tsx`)
```typescript
// Replace useAuthStableData with:
const { data: event, isLoading } = useEvent(eventId)
const { data: attendees } = useEventAttendees(eventId)
const { data: isRegistered } = useEventRegistrationStatus(eventId)
const registerMutation = useRegisterEvent()
```

#### 4. Leaderboard (`/leaderboard/page.tsx`)
```typescript
// Replace useAuthStableData with:
const { data: agents } = useAgents({ sortBy: 'popular', limit: 50 })
const { data: mcpServers } = useMCPServers({ sortBy: 'popular', limit: 50 })
```

#### 5. Profile (`/profile/page.tsx`)
```typescript
// Replace useAuthStableData with:
const { data: userAgents } = useUserAgents(user?.id)
```

#### 6. Search (`/search/page.tsx`)
```typescript
// Replace useAuthStableData with:
const { data: agents } = useSearchAgents(searchQuery, { sortBy, category })
const { data: mcpServers } = useSearchMCPServers(searchQuery, { sortBy, category })
```

### Cleanup Tasks
1. Delete `/src/hooks/useAuthStableData.ts`
2. Delete `/src/hooks/useStableData.ts`
3. Delete `/src/hooks/useSupabaseData.ts`
4. Delete `/src/hooks/useOptimizedSupabaseData.ts`
5. Delete `/src/hooks/useTabSwitchFix.ts`
6. Delete `/src/components/ui/tab-switch-fix.tsx`
7. Remove TabSwitchFix from layout
8. Delete old page backups (`page-old.tsx`)

## Benefits of React Query

### Performance
- Automatic background refetching
- Intelligent caching
- Request deduplication
- Stale-while-revalidate pattern

### Developer Experience
- Less boilerplate code
- Built-in loading/error states
- DevTools for debugging
- Industry standard

### Reliability
- Automatic retries
- Focus refetching
- Window focus management
- Mutation invalidation

## Configuration

### Query Client Settings
```typescript
{
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  refetchOnWindowFocus: false, // Fix tab-switch issues
  refetchOnReconnect: true,
  refetchOnMount: false, // Only fetch if stale
}
```

### Hook-Specific Settings
- Agents: 2 min staleTime, 10 min cacheTime
- Comments: 1 min staleTime
- Upvote status: 1 min staleTime
- Search: 1 min staleTime (ephemeral)

## Testing Checklist

After migration completion:

- [ ] Homepage loads without loading states on tab switch
- [ ] Agents listing page responsive to filters
- [ ] Agent details page upvoting works
- [ ] Agent comments post successfully
- [ ] MCP servers page functions correctly
- [ ] Events listing and registration work
- [ ] Leaderboard displays correctly
- [ ] Profile shows user's agents
- [ ] Search returns accurate results
- [ ] No console errors
- [ ] DevTools show query states correctly


