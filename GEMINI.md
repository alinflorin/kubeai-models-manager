# KubeAI Models Manager (kmm)

## Project Overview

This project is a full-stack web application for managing `Model` custom resources within a Kubernetes cluster, specifically those defined by the `kubeai.org` Custom Resource Definition (CRD). It consists of a React-based web UI and a Node.js/Express backend. The application allows users to view, create, edit, and delete these `Model` resources across different namespaces.

- **Frontend:** The frontend is a single-page application built with React, TypeScript, and Vite. It uses Microsoft's Fluent UI V9 for its component library, providing a modern and responsive user interface. The main entry point for the frontend is `src/App.tsx`.

- **Backend:** The backend is a Node.js server using the Express framework, also written in TypeScript. It provides a RESTful API that interacts directly with the Kubernetes API server using the `@kubernetes/client-node` library. It handles all the CRUD (Create, Read, Update, Delete) operations for the `models.kubeai.org` custom resources. The main entry point for the backend is `src/index.ts`. Additionally, it exposes a public, unauthenticated endpoint (`/public/api/models`) that formats the models for consumption by services compatible with the OpenRouter API specification.

- **Deployment:** The application is designed to be deployed on Kubernetes and includes a Helm chart located in the `chart/` directory for easy installation and management.

## Building and Running

The project is managed with `npm`. The following scripts are available in `package.json`:

-   **`npm start`**: Starts the backend development server in watch mode using `tsx`. The server listens on port 3000. The frontend is served by the same server thanks to `vite-express`.
-   **`npm run build`**: Builds both the frontend UI and the backend API for production.
-   **`npm run build-ui`**: Builds the React frontend using Vite. The output is placed in `dist/ui/`.
-   **`npm run build-api`**: Builds the Node.js backend using `esbuild`. The output is placed in `dist/api/`.

### Development

To run the application in a development environment:

1.  Ensure you have Node.js and `npm` installed.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm start`
4.  Open your browser to `http://localhost:3000`

### Production Build

To create a production-ready build:

1.  Install dependencies: `npm install`
2.  Run the build script: `npm run build`
3.  The `dist/` directory will contain the built UI and API.

## Development Conventions

-   **Code Style:** The project uses ESLint for linting. The configuration can be found in `eslint.config.js`.
-   **TypeScript:** The entire codebase, both frontend and backend, is written in TypeScript. Type safety is enforced via `tsconfig.json`.
-   **API:** The backend provides a RESTful API. API endpoints are defined in `src/index.ts`.
-   **Kubernetes Custom Resources:** The application is tightly coupled with the `models.kubeai.org` CRD. The schema for this resource is defined in `src/models/model.ts` using `zod` for validation.
-   **Deployment:** The application is deployed using a Helm chart. To deploy the application to a Kubernetes cluster, you can use the `helm` CLI with the chart located in the `chart/` directory.
