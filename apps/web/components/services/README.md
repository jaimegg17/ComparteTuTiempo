# Service Detail Components

This directory contains modular components for the service detail page (`/services/[id]`).

## Component Structure

```
services/
├── index.ts                      # Barrel export
├── ServiceImageSection.tsx       # Left side: Service image + status badge
├── ServiceDetailHeader.tsx       # Category chip + service title
├── ServiceInfoTabs.tsx          # Tab container (Details, Ratings, Location)
├── ServiceDetailsTab.tsx        # Tab 1: Description, provider info, exchanges
├── ServiceRatingsTab.tsx        # Tab 2: Rating summary + reviews list
├── ServiceLocationTab.tsx       # Tab 3: Location map placeholder
├── ServiceActionFooter.tsx      # Bottom: Request button + duration display
└── ServiceRequestDialog.tsx     # Modal: Request service form
```

## Usage

```tsx
import { ServiceImageSection, ServiceDetailHeader, ... } from '@/components/services';

// Each component is self-contained and receives only the props it needs
<ServiceImageSection imageUrl={...} title={...} status={...} />
<ServiceDetailHeader category={...} title={...} />
<ServiceInfoTabs service={...} />
<ServiceActionFooter isOwnService={...} onRequestService={...} />
```

## Shared Types

All components use shared type definitions from `@/types/service.types.ts`:
- `Service` - Main service interface
- `ServiceUser` - Provider user info
- `RatingItem` - Individual rating/review

## Benefits

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Maintainability**: Easier to test and debug
4. **Readability**: Main page reduced from 679 to ~220 lines
5. **Type Safety**: Shared types ensure consistency

