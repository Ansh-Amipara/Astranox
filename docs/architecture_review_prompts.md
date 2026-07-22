# Enterprise Architecture & Codebase Review Prompts

This document contains highly detailed, production-ready prompts for conducting comprehensive enterprise-level architecture and codebase reviews for both Frontend and Backend applications. Use these prompts with advanced AI models to get actionable, structural, and security-focused feedback on your codebase.

---

## 1. Frontend Architecture Review Prompt

Copy and paste the following prompt to review a React/Next.js frontend codebase:

```markdown
# Enterprise React Frontend Architecture & Codebase Review Prompt (Production-Ready)

You are a **Principal Frontend Architect, Senior React Engineer, UI/UX Architect, TypeScript Expert, Performance Engineer, Accessibility Expert, Security Engineer, Platform Engineer, and Staff Software Engineer.**

Analyze my **entire React frontend codebase** as if you are performing an **enterprise production architecture review** for a mission-critical application.

Do **NOT** simply explain what the code does.

Your responsibility is to identify:

* Missing architecture
* Bad practices
* Code smells
* UI inconsistencies
* Accessibility issues
* Performance bottlenecks
* Scalability issues
* Maintainability issues
* Production readiness gaps
* Enterprise best practices that are missing

Assume this application will be used by **hundreds of thousands to millions of users**.

---

# Project Information

Review whichever technologies are present, including but not limited to:

* React
* TypeScript
* Vite
* Next.js
* React Router
* TanStack Query
* Redux Toolkit
* Zustand
* Context API
* Axios
* Tailwind CSS
* Shadcn UI
* Radix UI
* Material UI
* Ant Design
* React Hook Form
* Zod
* Framer Motion
* Socket.IO
* i18n
* PWA
* Storybook
* Vitest
* Jest
* Cypress
* Playwright

Review additional technologies if present.

---

# Overall Review Rules

Review **every folder, every file, every component, every hook, every utility, every service, every context, every route, every type, every configuration, and every dependency.**

Do not skip anything.

For every item explain:

* Purpose
* Responsibility
* Whether implementation is correct
* Whether architecture is correct
* Whether enterprise standards are followed
* What is missing
* What should be improved
* Recommended enterprise implementation
* Example code where appropriate

---

# Folder Structure Review

Review every folder including but not limited to:

`\``\``text
src/
│
├── app/
├── modules/
├── pages/
├── routes/
├── layouts/
├── components/
│   ├── ui/
│   ├── common/
│   ├── forms/
│   ├── tables/
│   ├── dialogs/
│
├── hooks/
├── services/
├── api/
├── contexts/
├── providers/
├── stores/
├── constants/
├── utils/
├── helpers/
├── lib/
├── types/
├── schemas/
├── assets/
├── styles/
├── themes/
├── icons/
├── config/
├── middleware/
├── permissions/
├── i18n/
├── tests/
└── shared/
`\``\``

For every folder explain:

* Responsibility
* Enterprise purpose
* Whether structure is correct
* Missing folders
* Recommended improvements

---

# React Architecture Review

Verify whether the frontend follows enterprise architecture principles.

Check:

* Feature-first architecture
* Modular architecture
* Shared components
* Shared hooks
* Shared services
* Separation of concerns
* Component isolation
* Business logic separation
* API abstraction
* Routing organization
* Folder consistency
* Circular dependencies
* Reusability
* Scalability

List every violation.

Recommend enterprise improvements.

---

# Component Review

Review every component.

Check:

* Component responsibility
* Reusability
* Component composition
* Prop design
* Naming
* Memoization
* Render optimization
* Accessibility
* Error handling
* Loading states
* Empty states
* Skeleton UI
* Conditional rendering
* Type safety

Identify components that should be split.

---

# Hooks Review

Review every custom hook.

Check:

* Single Responsibility
* Reusability
* Dependency management
* Side effects
* Cleanup
* Performance
* Naming
* Generic implementation

Recommend improvements.

---

# State Management Review

Review:

* Context API
* Zustand
* Redux Toolkit
* TanStack Query
* Local state
* URL state

Check:

* State duplication
* Over-fetching
* Global vs local state
* Cache management
* Optimistic updates
* Invalidations

Recommend improvements.

---

# API Layer Review

Review:

* Axios configuration
* Fetch abstraction
* API services
* Authentication
* Interceptors
* Error handling
* Retry strategy
* Request cancellation
* File uploads
* Pagination

Recommend enterprise improvements.

---

# Forms Review

Review:

* React Hook Form
* Zod
* Validation
* Error handling
* Accessibility
* Reusable form fields
* Form abstraction
* Dynamic forms

---

# Routing Review

Review:

* Route organization
* Nested routes
* Lazy loading
* Route guards
* Authentication
* Authorization
* Error boundaries
* 404 handling
* Suspense

---

# UI/UX Review

Review:

* Responsive Design
* Mobile-first approach
* Tablet support
* Desktop support
* Dark mode
* Theme consistency
* Design system
* Typography
* Spacing
* Colors
* Icons
* Empty states
* Error states
* Skeleton loaders
* Loading indicators
* Animation consistency

Identify inconsistent UI patterns.

---

# Accessibility Review

Review against WCAG 2.2.

Check:

* Keyboard navigation
* Focus management
* Screen reader support
* ARIA labels
* Semantic HTML
* Color contrast
* Accessible forms
* Accessible dialogs
* Accessible tables

Assign:

* Critical
* High
* Medium
* Low

---

# Performance Review

Analyze:

* React.memo usage
* useMemo usage
* useCallback usage
* Lazy loading
* Code splitting
* Bundle size
* Tree shaking
* Image optimization
* Suspense
* Virtualization
* Pagination
* Infinite scrolling
* Re-render frequency
* Context performance
* React Query caching

Recommend optimizations.

---

# Security Review

Review:

* XSS
* CSRF
* Token storage
* LocalStorage usage
* Session management
* CSP readiness
* Input sanitization
* Route protection
* Permission checks

Assign risk levels.

---

# Styling Review

Review:

* Tailwind usage
* CSS organization
* Utility classes
* Theme tokens
* Component variants
* Responsive utilities
* Duplicate styles
* Inline styles

Recommend improvements.

---

# TypeScript Review

Review:

* any usage
* Unknown usage
* Interface design
* Type aliases
* Generics
* Utility types
* Enums
* Type safety
* API typing

Recommend improvements.

---

# Testing Review

Review:

* Unit tests
* Component tests
* Integration tests
* E2E tests
* Storybook
* Visual regression testing

Recommend target coverage.

---

# Build Review

Review:

* Vite configuration
* Environment variables
* Code splitting
* Asset optimization
* Bundle analysis
* Source maps
* Production build

---

# Dependency Review

Review:

* Unused packages
* Duplicate packages
* Large packages
* Tree-shaking compatibility
* Security vulnerabilities
* Alternatives

Recommend improvements.

---

# Documentation Review

Review:

* README
* Component documentation
* Storybook
* Design system
* Folder documentation
* Architecture documentation

---

# Enterprise Architecture Review

Review:

* Modular architecture
* Feature-first organization
* Shared library
* Design system
* Component library
* API abstraction
* Permission system
* Notification architecture
* Theme architecture
* Internationalization
* Offline readiness
* PWA readiness

Recommend improvements.

---

# Scalability Review

Review:

* Module boundaries
* Dynamic imports
* Lazy loading
* Micro-frontend readiness
* Shared UI library
* Shared hooks
* Shared services
* State scalability
* Performance under large datasets

---

# Production Readiness Review

Check:

* Error Boundaries
* Logging
* Analytics
* Monitoring
* Performance tracking
* Bundle optimization
* Accessibility
* Security
* Environment management
* Feature flags

---

# Final Report

Generate:

1. Executive Summary
2. Architecture Score (/10)
3. Code Quality Score (/10)
4. UI/UX Score (/10)
5. Accessibility Score (/10)
6. Performance Score (/10)
7. Security Score (/10)
8. Scalability Score (/10)
9. Maintainability Score (/10)
10. TypeScript Quality Score (/10)
11. Testing Score (/10)
12. Production Readiness Score (/10)

---

# Issue Report

Categorize findings into:

* Critical Issues
* High Priority Issues
* Medium Priority Issues
* Low Priority Issues

For every issue include:

* Problem
* Root Cause
* Business Impact
* Technical Impact
* Risk Level
* Recommended Solution
* Example Refactor
* Estimated Effort
* Expected Benefits

---

# Enterprise Roadmap

Create a prioritized roadmap:

* Phase 1 – Critical fixes before production
* Phase 2 – Security & Accessibility
* Phase 3 – Performance Optimization
* Phase 4 – Scalability & Architecture
* Phase 5 – Enterprise Enhancements

Include:

* Objectives
* Tasks
* Dependencies
* Estimated Duration
* Expected Outcomes

---

# Production Release Checklist

Generate a checklist covering:

* Architecture
* Components
* Routing
* State Management
* API Layer
* Forms
* Accessibility
* Performance
* Security
* Styling
* TypeScript
* Testing
* Documentation
* Build
* Monitoring
* Analytics
* Deployment

---

# Deliverables

The final output should include:

1. Executive Summary
2. Detailed review of every folder and module
3. React architecture review
4. Component review
5. Hooks review
6. State management review
7. API layer review
8. Performance assessment
9. Accessibility assessment
10. Security assessment
11. TypeScript assessment
12. UI/UX assessment
13. Bundle analysis
14. Architecture diagrams (Mermaid)
15. Component relationship diagrams (Mermaid)
16. Route flow diagrams (Mermaid)
17. Issue register with priorities
18. Scorecard
19. Enterprise implementation roadmap
20. Production readiness checklist
21. Enterprise best-practice recommendations
```

---

## 2. Backend Architecture Review Prompt

Copy and paste the following prompt to review a Node.js/Express/NestJS backend codebase:

```markdown
# Enterprise Backend Architecture & Codebase Review Prompt (Production-Ready)

You are a **Principal Backend Architect, Senior Software Engineer, Database Architect, Performance Engineer, Security Engineer, Platform Engineer, and Staff Software Engineer.**

Analyze my **entire backend codebase** as if you are performing an **enterprise production architecture review** for a mission-critical application.

Do **NOT** simply explain what the code does.

Your responsibility is to identify:

* Missing architecture
* Bad practices
* Code smells
* Security vulnerabilities
* Performance bottlenecks
* Database inefficiencies
* Scalability issues
* Maintainability issues
* Production readiness gaps
* Enterprise best practices that are missing

Assume this application will be used by **hundreds of thousands to millions of users** and handle high transaction volumes.

---

# Project Information

Review whichever technologies are present, including but not limited to:

* Node.js
* Express / NestJS / Fastify
* TypeScript
* Prisma / TypeORM / Sequelize
* PostgreSQL / MySQL / MongoDB
* Redis
* JWT / OAuth / Session Auth
* Zod / Joi / class-validator
* Jest / Mocha / Chai / Supertest
* Swagger / OpenAPI
* Docker
* CI/CD Pipelines
* WebSockets / Socket.IO
* Message Queues (RabbitMQ, Kafka, BullMQ)

Review additional technologies if present.

---

# Overall Review Rules

Review **every folder, every file, every controller, every service, every model, every route, every middleware, every utility, every configuration, and every dependency.**

Do not skip anything.

For every item explain:

* Purpose
* Responsibility
* Whether implementation is correct
* Whether architecture is correct
* Whether enterprise standards are followed
* What is missing
* What should be improved
* Recommended enterprise implementation
* Example code where appropriate

---

# Folder Structure Review

Review every folder including but not limited to:

`\``\``text
src/
│
├── api/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│
├── services/
├── repositories/
├── models/
├── config/
├── db/
│   ├── migrations/
│   ├── seeds/
│
├── utils/
├── helpers/
├── lib/
├── types/
├── schemas/
├── constants/
├── errors/
├── events/
├── jobs/
├── tests/
└── shared/
`\``\``

For every folder explain:

* Responsibility
* Enterprise purpose
* Whether structure is correct
* Missing folders
* Recommended improvements

---

# Backend Architecture Review

Verify whether the backend follows enterprise architecture principles.

Check:

* Domain-Driven Design (DDD) / Clean Architecture / Layered Architecture
* Controller-Service-Repository pattern
* Separation of concerns
* API versioning
* Dependency Injection
* Module isolation
* Business logic separation
* Circular dependencies
* Reusability
* Scalability

List every violation.

Recommend enterprise improvements.

---

# Controller Review

Review every controller.

Check:

* Thin controllers (business logic should be in services)
* Request validation
* Response formatting
* Error handling
* HTTP status codes
* Authentication / Authorization checks

Identify controllers that are doing too much.

---

# Service Layer Review

Review every service.

Check:

* Single Responsibility
* Business logic implementation
* Transaction management
* Error throwing
* Third-party integrations
* Reusability

Recommend improvements.

---

# Database & Repository Review

Review:

* Prisma / ORM usage
* Schema design
* Indexing strategies
* N+1 query problems
* Connection pooling
* Query performance
* Transactions
* Data integrity
* Migrations

Recommend optimizations and structural improvements.

---

# API & Routing Review

Review:

* RESTful conventions / GraphQL schema
* Route organization
* Middleware ordering
* Request payload validation
* Rate limiting
* Pagination & filtering strategies
* Idempotency

---

# Security Review

Review:

* Authentication (JWT, sessions, refresh tokens)
* Authorization (RBAC, ABAC)
* Password hashing (Bcrypt, Argon2)
* SQL Injection / NoSQL Injection prevention
* XSS, CSRF protection
* Rate limiting & Throttling
* CORS configuration
* Sensitive data exposure
* Environment variable management

Assign:

* Critical
* High
* Medium
* Low

---

# Performance Review

Analyze:

* Event loop blocking code
* Caching strategies (Redis, memory caching)
* Memory leaks
* Async/await usage
* Promise.all optimizations
* Background jobs & message queues
* Large payload handling
* Database query execution time

Recommend optimizations.

---

# Error Handling & Logging Review

Review:

* Global error handler
* Custom error classes
* Logging levels (Info, Warn, Error, Debug)
* Log formatting (e.g., JSON logs with Pino/Winston)
* Request/Response logging
* Uncaught exceptions / Unhandled rejections

---

# TypeScript Review

Review:

* `any` usage
* `unknown` usage
* Interface vs Type design
* Generics
* Enums
* Strict mode compliance
* Return type definitions

Recommend improvements.

---

# Testing Review

Review:

* Unit tests (Services, Utils)
* Integration tests (API endpoints, Database interactions)
* E2E tests
* Mocking strategies
* Test coverage

Recommend target coverage and missing test scenarios.

---

# Production Readiness Review

Check:

* PM2 / Docker configuration
* Graceful shutdown
* Health checks
* Monitoring & APM (New Relic, Datadog, Prometheus)
* CI/CD pipeline configuration
* Environment configurations

---

# Final Report

Generate:

1. Executive Summary
2. Architecture Score (/10)
3. Code Quality Score (/10)
4. Database Score (/10)
5. Security Score (/10)
6. Performance Score (/10)
7. TypeScript Quality Score (/10)
8. Testing Score (/10)
9. Production Readiness Score (/10)

---

# Issue Report

Categorize findings into:

* Critical Issues
* High Priority Issues
* Medium Priority Issues
* Low Priority Issues

For every issue include:

* Problem
* Root Cause
* Business Impact
* Technical Impact
* Risk Level
* Recommended Solution
* Example Refactor
* Estimated Effort

---

# Enterprise Roadmap

Create a prioritized roadmap:

* Phase 1 – Critical Security & Bug Fixes
* Phase 2 – Performance & Database Optimization
* Phase 3 – Architecture & Refactoring
* Phase 4 – Scalability & Testing
* Phase 5 – Enterprise Enhancements

---

# Deliverables

The final output should include:

1. Executive Summary
2. Detailed review of every folder and module
3. Backend architecture review
4. Controller & Service review
5. Database & Repository review
6. Security assessment
7. Performance assessment
8. TypeScript assessment
9. Architecture diagrams (Mermaid)
10. ERD / Database schema diagrams (Mermaid)
11. Issue register with priorities
12. Scorecard
13. Enterprise implementation roadmap
14. Production readiness checklist
```
