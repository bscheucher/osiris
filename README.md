# iBOS_nG Frontend

[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

This is the frontend for the iBOS_nG project, a Next.js application built to replace the legacy iBOS classic system for Ibis Acam.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Building & Testing](#building--testing)

## Getting Started

### Prerequisites

- Node.js >= 22 ([download](https://nodejs.org) or install via [NVM](https://github.com/nvm-sh/nvm) - recommended)

### Development Setup

1. Create a file called `.env.local` and configure it with the help of the instructions in [CONFIGURATION.md Section Local](CONFIGURATION.md#local).  
A `.env.example` file is provided with some values already filled out with useful defaults. It also contains hints for the remaining vars' values.

1. Install dependencies and start the development server:

   ```bash
   npm i && npm run dev
   ```

2. Access the app at [http://localhost:3000](http://localhost:3000)

### Authentication

- Use your AD-specific account (`firstname.lastname@ibisacamIT.onmicrosoft.com`)

### Environment Variables

See the documentation in [CONFIGURATION.md](CONFIGURATION.md)

## Building & Testing

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```
