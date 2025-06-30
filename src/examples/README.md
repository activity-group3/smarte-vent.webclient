# Refactored Components with Custom Hooks

This directory contains examples of how to refactor existing components using the new custom hooks for better maintainability and readability.

## Available Hooks

### 1. `usePagination`
Handles pagination state and logic.

```tsx
const {
  pagination,
  handlePageChange,
  handlePageSizeChange,
  resetPage,
  setTotalPages,
  getApiPage,
} = usePagination({
  initialPage: 1,
  initialPageSize: 10,
});
```

### 2. `useSorting`
Handles sorting state and logic.

```tsx
const {
  sorting,
  handleSortChange,
  toggleDirection,
  setSorting,
  getSortString,
} = useSorting<SortField>({
  initialField: "startDate",
  initialDirection: "desc",
});
```

### 3. `useFilters`
Handles filter state management.

```tsx
const {
  filters,
  updateFilter,
  resetFilters,
  handleSelectChange,
  handleInputChange,
  handleDateChange,
  getActiveFilters,
  buildQueryParams,
} = useFilters<FilterType>({
  initialFilters: {
    name: "",
    status: "",
    category: "",
  },
});
```

### 4. `useApiData`
Comprehensive hook that combines pagination, sorting, filters, and API calls.

```tsx
const {
  data,
  loading,
  error,
  pagination,
  sorting,
  filters,
  refetch,
  handlePageChange,
  handleSortChange,
  updateFilter,
  resetFilters,
} = useApiData<DataType, FilterType, SortField>({
  endpoint: "http://localhost:8080/api/data",
  initialFilters,
  initialSortField: "createdAt",
  initialSortDirection: "desc",
  initialPageSize: 20,
});
```

### 5. `useModal`
Handles modal state and data management.

```tsx
const modal = useModal<ItemType>();

// Usage
modal.open(item); // Open modal with data
modal.close(); // Close modal
modal.updateData({ field: 'value' }); // Update modal data
```

### 6. `useTableActions`
Handles common CRUD operations.

```tsx
const {
  loading,
  error,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleStatusChange,
} = useTableActions<ItemType>({
  onRefresh: refetch,
});
```

### 7. `useFormValidation`
Handles form state and validation.

```tsx
const {
  values,
  errors,
  isValid,
  setValue,
  handleInputChange,
  validateForm,
  resetForm,
} = useFormValidation<FormType>({
  initialValues: {
    name: "",
    email: "",
  },
  validationRules: {
    name: [ValidationRules.required()],
    email: [ValidationRules.required(), ValidationRules.email()],
  },
});
```

## Benefits of Using These Hooks

1. **Reduced Code Duplication**: Common patterns are extracted into reusable hooks
2. **Better Separation of Concerns**: Business logic is separated from UI components
3. **Easier Testing**: Hooks can be tested independently
4. **Improved Maintainability**: Changes to common logic only need to be made in one place
5. **Type Safety**: Full TypeScript support with generic types
6. **Consistent API**: All hooks follow similar patterns and naming conventions

## Migration Guide

### Before (Original Code)
```tsx
const [activities, setActivities] = useState([]);
const [page, setPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);
const [filters, setFilters] = useState({
  name: "",
  status: "",
});
const [sorting, setSorting] = useState({
  field: "startDate",
  direction: "desc",
});

const fetchActivities = async () => {
  // Complex fetch logic with manual query building
};

const handlePageChange = (event, value) => {
  setPage(value - 1);
};

const handleFilterChange = (field) => (event) => {
  setFilters(prev => ({
    ...prev,
    [field]: event.target.value,
  }));
  setPage(0);
};

// More boilerplate code...
```

### After (Using Hooks)
```tsx
const {
  data: activities,
  loading,
  error,
  pagination,
  sorting,
  filters,
  handlePageChange,
  handleSortChange,
  updateFilter,
  resetFilters,
  handleInputChange,
  handleSelectChange,
} = useApiData<Activity, ActivityFilters, SortField>({
  endpoint: "http://localhost:8080/activities/search",
  initialFilters: {
    name: "",
    status: "",
  },
  initialSortField: "startDate",
  initialSortDirection: "desc",
});

// That's it! All the logic is handled by the hook.
```

## Usage Examples

See the refactored components in this directory for complete examples of how to use these hooks in real applications.

### Key Files:
- `AdminActivityManageRefactored.tsx` - Shows how to refactor a complex activity management page
- `AccountManagementRefactored.tsx` - Example of account management with form validation
- `ParticipantManagementRefactored.tsx` - Demonstrates participant management with modals

These examples show significant reduction in code complexity while maintaining the same functionality. 
