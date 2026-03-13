# TanStack Query Integration Guide

## Overview
This project uses **TanStack Query (React Query)** for efficient data fetching, caching, and state management. All API calls have been refactored to use custom hooks built on top of TanStack Query.

## Project Structure

```
frontend/src/
├── hooks/
│   ├── quotations/
│   │   ├── useQuotations.ts          # Fetch quotations and auto codes
│   │   └── useQuotationMutations.ts  # Create & update quotations
│   ├── parts/
│   │   └── useParts.ts               # Fetch parts and part details
│   ├── tickets/
│   │   └── useTickets.ts             # Fetch tickets
│   └── settings/
│       └── useSettings.ts            # Fetch default tax settings
├── components/
│   └── providers/
│       └── QueryProvider.tsx          # TanStack Query provider
└── app/
    └── layout.tsx                     # Root layout with QueryProvider
```

## Available Hooks

### 1. Quotations Hooks

#### `useQuotations(options)`
Fetch a list of quotations with filtering options.

```typescript
import { useQuotations } from '@/hooks/quotations/useQuotations';

const { data, isLoading, error, refetch } = useQuotations({
  limit: '10',
  page: '1',
  search: 'TKT-001',
  status: 'DRAFTED'
});
```

#### `useQuotationById(id)`
Fetch a single quotation by ID.

```typescript
import { useQuotationById } from '@/hooks/quotations/useQuotations';

const { data: quotation, isLoading } = useQuotationById(quotationId);
```

#### `useQuotationAutoCode()`
Fetch the next available quotation auto code.

```typescript
import { useQuotationAutoCode } from '@/hooks/quotations/useQuotations';

const { data: autoCode } = useQuotationAutoCode();
```

#### `useCreateQuotation()`
Mutation hook for creating a new quotation.

```typescript
import { useCreateQuotation } from '@/hooks/quotations/useQuotationMutations';

const createMutation = useCreateQuotation();

const handleCreate = async () => {
  await createMutation.mutateAsync(quotationData);
};

// Access loading state
const { isPending, isError, error } = createMutation;
```

#### `useUpdateQuotation()`
Mutation hook for updating an existing quotation.

```typescript
import { useUpdateQuotation } from '@/hooks/quotations/useQuotationMutations';

const updateMutation = useUpdateQuotation();

const handleUpdate = async () => {
  await updateMutation.mutateAsync({
    id: quotationId,
    data: quotationData
  });
};
```

### 2. Parts Hooks

#### `useParts(options)`
Fetch a list of parts with search functionality.

```typescript
import { useParts } from '@/hooks/parts/useParts';

const { data: parts = [], isLoading } = useParts({
  limit: '1000',
  search: 'brake pad',
  enabled: true  // Optional: control when query runs
});
```

#### `usePartById(partId)`
Fetch details of a single part.

```typescript
import { usePartById } from '@/hooks/parts/useParts';

const { data: part } = usePartById(partId);
```

#### `usePartsByIds(partIds)`
Fetch details of multiple parts by their IDs.

```typescript
import { usePartsByIds } from '@/hooks/parts/useParts';

const { data: partsDetails } = usePartsByIds(['id1', 'id2', 'id3']);
```

### 3. Tickets Hooks

#### `useTickets(options)`
Fetch a list of tickets.

```typescript
import { useTickets } from '@/hooks/tickets/useTickets';

const { data: tickets } = useTickets({
  status: 'OPEN',
  assignedTo: technicianId
});
```

#### `useTicketById(id)`
Fetch a single ticket by ID.

```typescript
import { useTicketById } from '@/hooks/tickets/useTickets';

const { data: ticket } = useTicketById(ticketId);
```

### 4. Settings Hooks

#### `useDefaultTax()`
Fetch the default tax percentage.

```typescript
import { useDefaultTax } from '@/hooks/settings/useSettings';

const { data: taxPercentage = 20 } = useDefaultTax();
```

## Key Features

### 1. Automatic Caching
TanStack Query automatically caches data to reduce unnecessary API calls.

```typescript
// First call - fetches from API
const { data } = useQuotationById('123');

// Second call with same ID - returns from cache instantly
const { data: sameQuotation } = useQuotationById('123');
```

### 2. Automatic Refetching
Data is automatically kept fresh based on `staleTime` configuration.

```typescript
// Data is considered fresh for 30 seconds
queryKey: ['quotations'],
staleTime: 30000,  // 30 seconds
gcTime: 5 * 60 * 1000,  // Cache for 5 minutes
```

### 3. Cache Invalidation
Mutations automatically invalidate related queries.

```typescript
// After creating a quotation, the quotations list is automatically refetched
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => await createItem('/quotations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created!');
    },
  });
};
```

### 4. Loading & Error States
Easy access to loading and error states.

```typescript
const { data, isLoading, isError, error, refetch } = useQuotations();

if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage error={error} />;

return <QuotationsList data={data} />;
```

### 5. Conditional Queries
Control when queries run with the `enabled` option.

```typescript
// Only fetch parts when the modal is open
const { data: parts } = useParts({
  enabled: isModalOpen
});

// Only fetch quotation when ID exists
const { data: quotation } = useQuotationById(
  quotationId || null,
  { enabled: !!quotationId }
);
```

## Migration Examples

### Before (Direct API Calls)
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAll('/quotations');
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### After (TanStack Query)
```typescript
const { data, isLoading } = useQuotations();
```

## Best Practices

### 1. Use Custom Hooks
Always use the custom hooks instead of calling API functions directly.

✅ **Good:**
```typescript
const { data } = useQuotations();
```

❌ **Bad:**
```typescript
const data = await getAll('/quotations');
```

### 2. Handle Loading States
Always handle loading states in your UI.

```typescript
const { data, isLoading } = useQuotations();

if (isLoading) {
  return <div className="animate-spin">Loading...</div>;
}

return <DataTable data={data} />;
```

### 3. Use Mutations for Write Operations
Use mutation hooks for create, update, and delete operations.

```typescript
const createMutation = useCreateQuotation();

const handleSubmit = async (formData) => {
  try {
    await createMutation.mutateAsync(formData);
    // Success handled by mutation hook
  } catch (error) {
    // Error handled by mutation hook
  }
};
```

### 4. Leverage Automatic Refetching
Don't manually refetch after mutations - it happens automatically.

```typescript
// No need to manually refetch after create/update
const createMutation = useCreateQuotation(); // Automatically invalidates cache

const handleCreate = async () => {
  await createMutation.mutateAsync(data);
  // Quotations list automatically refetches
};
```

### 5. Use Query Keys Consistently
Query keys are used for caching and invalidation.

```typescript
// Consistent query keys
['quotations'] // List of all quotations
['quotation', id] // Single quotation
['parts'] // List of all parts
['part', id] // Single part
```

## Performance Benefits

1. **Reduced API Calls**: Cached data is reused across components
2. **Faster UI**: Instant data from cache while revalidating in background
3. **Better UX**: Automatic loading and error states
4. **Optimistic Updates**: UI updates immediately, syncs with server in background
5. **Request Deduplication**: Multiple components requesting same data only trigger one API call

## Debugging

### View Cache in React DevTools
Install React Query DevTools:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Common Issues

**Issue**: Data not updating after mutation
**Solution**: Ensure mutation invalidates the correct query keys

**Issue**: Too many API calls
**Solution**: Increase `staleTime` or use proper `enabled` conditions

**Issue**: Stale data showing
**Solution**: Decrease `staleTime` or manually trigger refetch

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices Guide](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
