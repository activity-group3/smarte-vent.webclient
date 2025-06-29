# Professional Pages Folder Structure Recommendation

## Current Issues
- Mixed naming conventions (PascalCase, kebab-case, hyphen-separated)
- Inconsistent terminology across role-based sections
- Misplaced components in pages folder
- Unclear folder names

## Recommended Structure

```
src/pages/
├── admin/
│   ├── account-management/           # was: Account-Management
│   │   └── index.tsx
│   ├── activity-management/          # was: Activity-Management  
│   │   ├── index.tsx
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── activity-detail/              # was: ActivityDetail
│   │   ├── index.tsx
│   │   └── activity-detail.css
│   ├── create-account/               # was: CreateAccount
│   │   └── index.tsx
│   ├── create-activity/              # was: CreateActivity
│   │   ├── index.tsx
│   │   └── create-activity.css
│   ├── dashboard/                    # consistent naming
│   │   ├── index.tsx
│   │   └── admin-dashboard.css
│   └── participant-management/       # was: Participant-Management
│       └── index.tsx
├── auth/                            # was: Auth (lowercase for consistency)
│   ├── login.tsx                    # was: Login.js (consistent extensions)
│   └── register.tsx                 # was: Register.js
├── shared/                          # was: Dashboard (rename for clarity)
│   └── dashboard/
│       └── index.tsx
├── error/                           # was: Error
│   ├── index.tsx
│   └── error.css
├── home/                            # was: Home
│   ├── index.tsx
│   └── home.css
├── organization/                    # was: Organization
│   ├── activity-detail/
│   │   ├── index.tsx
│   │   └── activity-detail.css
│   ├── activity-management/
│   │   ├── index.tsx
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── analytics/                   # was: Analysis (more professional term)
│   │   └── index.tsx
│   ├── create-activity/
│   │   └── index.tsx
│   ├── dashboard/
│   │   └── index.tsx
│   ├── profile/                     # was: Information (clearer naming)
│   │   └── index.tsx
│   ├── organization-list/           # was: OrganizationList
│   │   └── index.tsx
│   └── participant-management/      # was: ParticipantManagement
│       ├── index.tsx
│       └── activity-detail.css
└── user/
    ├── activity-detail/
    │   ├── index.tsx
    │   └── activity-detail.css
    ├── analytics/                   # was: Analysis
    │   └── index.tsx
    ├── dashboard/
    │   ├── index.tsx
    │   └── dashboard.css
    ├── contribution-management/     # was: Manage-Contribution (clearer naming)
    │   └── index.tsx
    ├── my-activities/              # was: MyActivities
    │   └── index.tsx
    ├── my-participations/          # was: MyParticipant (more descriptive)
    │   └── index.tsx
    ├── participant-management/     # was: Participant-Management
    │   ├── index.tsx
    │   ├── activity-detail.css
    │   └── activity-participant-management.tsx  # was: ActivityParticipantManagement.tsx
    └── verification/
        └── index.tsx
```

## Components to Move Out of Pages

```
src/components/
└── navigation/
    └── sidebar/                     # Move from src/pages/SideBar/
        └── index.tsx
```

## Global Styles Structure

```
src/styles/
├── globals.css
├── auth.css                        # Move from src/pages/styles/auth.css
└── components/
    └── [component-specific styles]
```

## Naming Convention Rules

### Folders
- **Use kebab-case consistently** for all folder names
- **Be descriptive**: `analytics` instead of `analysis`
- **Use standard terminology**: `profile` instead of `information`
- **Avoid abbreviations**: `participant-management` not `part-mgmt`

### Files
- **Components**: PascalCase (e.g., `ActivityDetail.tsx`)
- **Pages**: kebab-case folders with `index.tsx`
- **Utilities**: camelCase (e.g., `dateUtils.ts`)
- **Constants**: camelCase (e.g., `apiConstants.ts`)
- **Styles**: Match component name (e.g., `activity-detail.css`)

### Consistency Rules
- Same concepts should have same names across all role sections
- Use consistent file extensions (.tsx for components, .ts for utilities)
- Group related files in the same folder
- Separate shared components from page components

## Benefits of This Structure

1. **Consistency**: All folders use kebab-case
2. **Clarity**: Names clearly indicate purpose
3. **Scalability**: Easy to add new features
4. **Maintainability**: Related files are grouped together
5. **Professional**: Follows industry standards
6. **SEO-friendly**: Kebab-case URLs are more readable 
