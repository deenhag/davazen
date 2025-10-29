# DavaZen: UYAP Case Management Assistant

DavaZen is a secure, serverless web application designed to help legal professionals in Turkey manage their caseload. As a web application, DavaZen provides a streamlined interface for users to manually enter their case data from UYAP. Once entered, users can search, filter, and view case details at a glance. The core feature is the ability to add private, persistent notes to each case, enhancing the raw data with personal insights and reminders. All data is securely stored on Cloudflare's edge network using Durable Objects, ensuring fast access and data integrity. The user interface is built with a focus on minimalist design, clarity, and ease of use, creating a calm and productive environment for managing sensitive legal information.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deenhag/davazen)

## Key Features

-   **Manual Case Entry**: A simple and intuitive form to log new legal cases.
-   **Secure Data Storage**: All case data and notes are persisted on Cloudflare's edge network using a single Durable Object for speed and reliability.
-   **Powerful Search & Filtering**: Instantly find cases by case number, party name, or other criteria.
-   **Private Case Notes**: Add, edit, and view persistent notes for each case to keep track of important details and reminders.
-   **Responsive Design**: A clean, minimalist interface that works flawlessly on desktop and mobile devices.
-   **Single Page Application**: Fast and fluid user experience built with modern web technologies.

## Technology Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS
-   **UI Components**: shadcn/ui, Lucide React, Framer Motion
-   **Backend**: Hono on Cloudflare Workers
-   **State Management**: Zustand (Client-Side), Durable Objects (Server-Side)
-   **Forms**: React Hook Form with Zod for validation
-   **Package Manager**: Bun

## Getting Started

Follow these instructions to get a local copy of the project up and running for development purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   Wrangler CLI installed and configured: `bun install -g wrangler`.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd davazen
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

## Development

To start the local development server, which includes the Vite frontend and a local instance of the Cloudflare Worker, run the following command:

```sh
bun dev
```

This will start the application, typically available at `http://localhost:3000`. The frontend will automatically proxy API requests to the local worker instance.

## Deployment

This application is designed for easy deployment to Cloudflare's global network.

1.  **Build the application:**
    The deployment script handles the build process automatically.

2.  **Deploy to Cloudflare:**
    Run the deploy command. This will build the frontend, bundle the worker, and deploy everything to your Cloudflare account.

    ```sh
    bun deploy
    ```

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deenhag/davazen)

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers, including API routes and Durable Object entity definitions.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the worker to ensure type safety.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.