# CampusHub

A comprehensive student activity management platform built with React, TypeScript, and modern web technologies. This application provides role-based interfaces for administrators, organizations, and students to manage, participate in, and analyze educational activities.

## 🎯 Overview

CampusHub is a full-featured web application designed to streamline student activity management in educational institutions. The platform supports three distinct user roles with specialized dashboards and functionality tailored to their specific needs.

### Key Features

- **Multi-Role Architecture**: Separate interfaces for Admins, Organizations, and Students
- **Activity Management**: Complete lifecycle management of educational activities
- **Real-time Analytics**: Comprehensive reporting and data visualization
- **Participant Management**: Advanced tools for managing activity participation
- **Responsive Design**: Modern UI with Material-UI and Tailwind CSS
- **Type-Safe Development**: Full TypeScript implementation with custom hooks

## 🚀 Technology Stack

### Frontend Framework
- **React 18.2.0** - Modern React with hooks and concurrent features
- **TypeScript 5.2.2** - Type-safe development
- **Vite 5.0.11** - Fast build tool and development server

### UI & Styling
- **Material-UI 5.17.1** - Comprehensive component library
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.18.2** - Advanced animations
- **Lucide React** - Modern icon library

### State Management & Data
- **Redux Toolkit 2.8.2** - Predictable state management
- **Axios 1.10.0** - HTTP client for API communication
- **React Query patterns** - Custom hooks for data fetching

### Charts & Visualization
- **Recharts 2.15.3** - Data visualization library
- **MUI X-Charts 6.19.2** - Advanced charting components
- **MUI X-Data-Grid 6.19.2** - Feature-rich data tables

### Development Tools
- **ESLint** - Code linting and quality
- **Vitest** - Unit testing framework
- **PostCSS** - CSS processing

## 🏗️ Architecture

### Custom Hooks System

The application features a sophisticated custom hooks system that significantly reduces code duplication and improves maintainability:

#### Core Data Management Hooks
- **`useApiData`** - Master hook combining pagination, sorting, and filtering
- **`usePagination`** - Standardized pagination logic
- **`useSorting`** - Type-safe sorting implementation
- **`useFilters`** - Generic filter state management

#### UI Management Hooks
- **`useModal`** - Modal state and data management
- **`useTableActions`** - CRUD operations with error handling
- **`useFormValidation`** - Form state and validation management

**Impact**: Reduces typical page code by 40-60% (300-500 lines → 150-200 lines)

### Role-Based Architecture

```
├── Admin Interface
│   ├── Account Management
│   ├── Activity Management
│   ├── Participant Oversight
│   └── System Analytics
├── Organization Interface
│   ├── Activity Creation & Management
│   ├── Participant Management
│   ├── Analytics & Reporting
│   └── Organization Profile
└── Student Interface
    ├── Activity Discovery
    ├── Participation Management
    ├── Personal Analytics
    └── Contribution Tracking
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── charts/          # Data visualization components
│   ├── navigation/      # Navigation components
│   └── forms/           # Form components
├── hooks/               # Custom React hooks
│   ├── useApiData.tsx   # Master data fetching hook
│   ├── usePagination.tsx
│   ├── useFilters.tsx
│   └── index.ts
├── pages/               # Role-based page components
│   ├── admin/           # Administrator interface
│   ├── organization/    # Organization interface
│   ├── user/           # Student interface
│   ├── auth/           # Authentication pages
│   └── shared/         # Shared pages
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── layouts/            # Page layout components
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusHub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables
   # Edit .env.local with your API endpoints and keys
   ```

4. **Database Setup**
   ```bash
   # Set up Appwrite backend
   npm run setup:db
   
   # Seed initial data (optional)
   npm run seed:discounts
   ```

### Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`

## 🔧 Development Guidelines

### Code Conventions

- **Naming**: Use kebab-case for folders, PascalCase for components
- **TypeScript**: Maintain strict type safety throughout
- **Hooks**: Prefer custom hooks for data management logic
- **Components**: Keep components focused and reusable

### Folder Structure Standards

- Role-based pages in `src/pages/{role}/`
- Shared components in `src/components/`
- Custom hooks in `src/hooks/`
- API services in `src/services/`
- Type definitions in `src/types/`

### Testing Strategy

- Unit tests for custom hooks
- Component testing for UI components
- Integration tests for critical user flows
- E2E tests for complete user journeys

## 🌟 Key Features by Role

### Administrator Dashboard
- **Account Management**: User creation, role assignment, account oversight
- **Activity Oversight**: System-wide activity monitoring and management
- **Analytics**: Comprehensive system metrics and reporting
- **Participant Management**: Cross-activity participant tracking

### Organization Dashboard
- **Activity Creation**: Rich activity creation with scheduling and requirements
- **Participant Management**: Registration, communication, and tracking
- **Analytics**: Organization-specific metrics and insights
- **Profile Management**: Organization information and settings

### Student Dashboard
- **Activity Discovery**: Browse and search available activities
- **Registration Management**: Join activities and track participation
- **Personal Analytics**: Individual progress and achievement tracking
- **Contribution Management**: Track and showcase contributions

## 🔌 API Integration

The application integrates with a backend API through:

- **Appwrite Backend**: Primary database and authentication
- **RESTful APIs**: Standard HTTP methods for data operations
- **Real-time Updates**: WebSocket connections for live data
- **File Management**: Image and document upload capabilities

### Service Layer

```typescript
src/services/
├── accountService.ts           # User account operations
├── activityStatisticsService.ts # Activity analytics
├── notificationService.ts      # Real-time notifications
├── organizationStatisticsService.ts # Organization metrics
└── studentStatisticsService.ts # Student analytics
```

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Material Design**: Consistent Material-UI component library
- **Dark/Light Theme**: Automatic theme switching
- **Accessibility**: WCAG compliant components
- **Interactive Charts**: Rich data visualization with Recharts
- **Smooth Animations**: Framer Motion powered transitions

## 🚦 Performance Optimizations

- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Memoization**: React.memo and useMemo for expensive computations
- **Bundle Optimization**: Vite's modern bundling strategies
- **Image Optimization**: Optimized asset delivery

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the established coding conventions
4. Write tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Run linting (`npm run lint`)
7. Commit changes (`git commit -m 'Add amazing feature'`)
8. Push to branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Custom hooks used for data management
- [ ] Components follow single responsibility principle
- [ ] Proper error handling implemented
- [ ] Loading states provided for async operations
- [ ] Responsive design verified
- [ ] Accessibility guidelines followed

## 📚 Documentation

- **Hook Documentation**: `src/examples/README.md`
- **Component Examples**: `src/examples/`
- **Folder Structure Guide**: `FOLDER_STRUCTURE_RECOMMENDATION.md`
- **Refactoring Guide**: `HOOKS_REFACTORING_SUMMARY.md`

## 🔄 Migration & Refactoring

The application is currently undergoing a systematic refactoring to implement the custom hooks architecture:

- **Phase 1**: Core hooks implementation ✅
- **Phase 2**: High-impact page refactoring (In Progress)
- **Phase 3**: Complete migration and optimization

Expected benefits:
- 40-60% code reduction in typical pages
- Improved type safety and maintainability
- Standardized patterns across the application
- Enhanced testing capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI team for the comprehensive component library
- React team for the excellent hooks architecture
- Vite team for the lightning-fast development experience
- The open-source community for the various packages that make this possible

---

For more information, please contact the development team or refer to the additional documentation in the `docs/` directory.
