# IbosNG Frontend

[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

This is the frontend for the IbosNG project, a Next.js application built to replace the legacy Ibos ERP system for Ibis Acam.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Architecture & Tooling](#architecture--tooling)
- [Component Structure](#component-structure)
- [Code Style Guide](#code-style-guide)
- [Building & Testing](#building--testing)
- [Domain Knowledge & Vocabulary](#domain-knowledge--vocabulary)

## Overview

IbosNG (New Generation) is designed to integrate with and eventually replace the legacy Ibos ERP system. This project focuses primarily on the frontend implementation, optimizing for best practices, maintainability, and developer experience.

**Tech Stack:**

- React
- Next.js 15
- TypeScript
- TailwindCSS
- React Hook Form + Yup
- Playwright for E2E testing
- Jest for unit testing

The backend is built with Java Spring Boot and communicated with via REST calls.

## Getting Started

### Prerequisites

- Node.js 22+ ([download](https://nodejs.org) or install via [NVM](https://github.com/nvm-sh/nvm) - recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>/ibosng-frontend
   cd ibosng-frontend
   ```

2. Obtain the `.env.local` file from a colleague and place it in the project root

3. Install dependencies and start the development server:

   ```bash
   npm i && npm run dev
   ```

4. Access the app at [http://localhost:3000](http://localhost:3000)

### Authentication

- Use your AD-specific account (`...@ibisacamIT.onmicrosoft.com` - not your msg email)
- If you don't have an account, check the `.env.local` file or ask a colleague for the Password page from Confluence

### Development Tips

- Enable "Verbose" in Chrome Developer Tools Console settings (Console tab → "All Levels") to see client-server communication more clearly

### Environment Variables

See the documentation [here](CONFIGURATION.md)

#### Certificate Verification Note

For development without VPN (ZScaler), you may need to disable certificate verification by setting `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env.local`. This is not recommended for production.

## Architecture & Tooling

### Current Architecture

#### React & Next.js

- Primarily using client-side components due to:
  - Next-auth requirements for Azure SSO
  - Better integration with react-hook-form
  - Zustand compatibility needs

#### Data Fetching

- Custom implementation using `fetch()` (see `gateway-utils.ts`)
- Small cache utility for optimization (`cache-utils.ts`)
- Common data stored via Zustand stores

#### State Management

- **Global/Multi-view State**: Zustand
- **Local Component State**: React's useState

#### Forms

- **Current Standard**: [React Hook Form](https://react-hook-form.com/) with custom input components for all data types
- **Legacy**: Generic form implementation with loops and dynamic form definition objects (to be phased out)

#### Styling

- **Primary**: TailwindCSS (Enterprise subscription for tailwindui.com)
- **Secondary**: Minimal CSS/SCSS for utility classes and animations
- **Legacy**: Material UI (to be removed)

#### Testing

- **Unit Tests**: Jest (limited maintenance)
- **E2E Tests**: Playwright (goal: 100% coverage)

## Component Structure

Components follow [Atomic Design](https://atomicdesign.bradfrost.com/chapter-2/) principles:

```
/components
  ├── /atoms       # Small, standalone components (buttons, headlines, form elements)
  ├── /molecules   # Components made of 2+ atoms (info boxes, pagination)
  ├── /organisms   # Components made of 2+ molecules (form layouts)
  └── /forms       # Larger, view-specific forms for reuse
```

### Material UI to Tailwind Migration

- New components should use `-tw` suffix in filenames (e.g., `button-tw.tsx`) and `Tw` in component names (e.g., `ButtonTw`)
- These suffixes will be removed once the transition is complete

## Code Style Guide

### 1. Consistent Naming Conventions

✅ **Good:**

```typescript
// Use camelCase everywhere
const userData = {
  firstName: 'John',
  lastName: 'Doe',
}

function getUserInfo() {
  // Function implementation
}
```

❌ **Bad:**

```typescript
// Mixing snake_case and improper casing
const user_data = {
  firstName: 'John',
  last_name: 'Doe',
}

function getUserinfo() {
  // Function implementation
}
```

### 2. Proper TypeScript Usage

✅ **Good:**

```typescript
// Use proper type definitions
const fieldName = field.dtoFieldName as keyof MyData
const value: MyData = data[fieldName]
```

❌ **Bad:**

```typescript
// @ts-ignore
const value = data[field.dtoFieldName]
```

### 3. Explicit Parameter Names

✅ **Good:**

```typescript
// Using explicit names according to data type
myCountryList.forEach((country, index) => {
  country.required = !country.id && index > 0
})
```

❌ **Bad:**

```typescript
// Using single-character params
myCountryList.forEach((o, j) => {
  o.required = !o.id && j > 0
})
```

## Building & Testing

### Development

```bash
npm run dev       # Start development server
```

### Production Build

```bash
npm run build     # Create production build
npm start         # Run the production build
```

### Testing

#### Jest (Unit Tests)

```bash
npm run test        # Run tests with coverage report
npm run test-watch  # Run tests in watch mode
```

Note: Jest tests are currently not maintained in favor of Playwright.

#### Playwright (E2E Tests)

```bash
npm i && npm run build  # Ensure latest code is built
npm run e2e             # Console-only mode (may have issues)
npm run e2e:ui          # UI mode (recommended)
npm run e2e:dev         # Combined command (recommended)
```

We aim to cover all use cases with E2E tests, though coverage is currently limited.

## Technical Debt

The following areas have been identified for improvement:

1. **Legacy Components & Development Patterns**:

   - Oldest parts (Teilnehmer Korrigieren and Dashboard Widgets) use outdated concepts
   - Material UI components should be replaced with Tailwind alternatives
   - `src/lib/*` contains a lot of `*-utils.ts` files with partially redundant or unused type definitions, this requires a refactor of the dashboard and "Teilnehmer Korrigieren" to be cleaned up entirely

2. **Data Fetching**:

   - Legacy methods using `prepareCall`, `getCall`, etc. should be replaced
   - Consider migration to SWR or TanStack Query

3. **State Management Challenges**:
   - Complex workarounds for next-auth integration
   - Form and error handling complexity
   - Client-server communication transparency

## Domain Knowledge & Vocabulary

### Company Background

**Ibis Acam** ([website](https://www.ibisacam.at/)) is a Training Provider ("Schulungsanbieter") for the Austrian Market Service ([AMS](https://de.wikipedia.org/wiki/Arbeitsmarktservice)).

### Systems

- **Ibos**: Legacy ERP web application built in PHP, covering ~50% of business processes
- **IbosNG**: New Generation system aiming to integrate with and eventually replace Ibos
- **Sage**: Previous accounting and payroll management tool (being replaced)
- **LHR**: New payroll and accounting software
- **Moxis**: Tool by [XiTrust](https://www.xitrust.com/) for digital signatures of PDF documents
- **Jasper Reports**: Tool by [JasperSoft](https://www.jaspersoft.com/) for generating dynamic PDF and Excel reports

### Integration Strategy

IbosNG maintains integrations with:

- **Ibos**: 1-2 year cross-integration period with data synchronization
- **LHR**: Complex integration due to concurrent development
- **Moxis**: Used for document signatures by multiple parties
- **Jasper Reports**: Used for report generation

### Common Abbreviations

| Abbreviation | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| Ibos         | Ibisacam Betriebs-Organisations-System                  |
| IbosNG       | Ibisacam Betriebs-Organisations-System - New Generation |
| UC           | Use Case                                                |
| RS           | Requirements Specification                              |
| FE           | Frontend                                                |
| BE           | Backend                                                 |
| MA           | Mitarbeiter (Employee)                                  |
| TN           | Teilnehmer (Participant)                                |
| UEBA         | Überbetrieblicher Mitarbeiter (Inter-company Employee)  |
| FK           | Führungskraft (Manager)                                 |

For more terms, refer to the [Glossary](https://msggroup.atlassian.net/wiki/spaces/IBOSNG/pages/257458186/Glossary).
