# Triton Studio

**A modern web-based management interface for NVIDIA Triton Inference Server.**

Triton Studio provides a comprehensive, user-friendly dashboard for managing Triton Inference Servers, exploring models, and testing inference endpoints. Built with modern web technologies, it simplifies the workflow of ML engineers and developers working with production inference deployments.

---

## Why use Triton Studio?

Triton Studio helps developers and ML engineers manage and interact with Triton Inference Servers through an intuitive web interface, eliminating the need for complex command-line tools or custom scripts.

Use Triton Studio for:

* **Centralized Server Management**. Manage multiple Triton Inference Servers from a single interface. Add, edit, and monitor servers with real-time health status checks. Keep track of all your inference infrastructure in one place.

* **Model Discovery & Inspection**. Browse models across all your servers, view detailed model configurations, inspect input/output schemas, and understand model capabilities without diving into configuration files.

* **Interactive Inference Testing**. Test your models directly from the browser with an intelligent form builder that adapts to model input shapes. Switch between guided forms and raw JSON input for maximum flexibility.

* **Real-time Monitoring**. Monitor server health status, view model statistics, and track inference performance metrics. Get instant visibility into your inference infrastructure.

* **Developer-Friendly Interface**. Built with modern React and TypeScript, featuring a beautiful dark UI optimized for developer workflows. Fast, responsive, and accessible.

* **Production-Ready Architecture**. Built on React Router v7 with server-side rendering, type-safe APIs, and robust error handling. Deploy with confidence using battle-tested patterns.

* **CORS-Free API Access**. Built-in proxy server eliminates CORS issues when connecting to Triton servers, making it easy to work with servers across different domains.

---

## Features

### 🖥️ Server Management
- **Multi-Server Support**: Manage multiple Triton Inference Servers from a single dashboard
- **Health Monitoring**: Real-time server status checks (ready/live/not-ready)
- **Service URL Management**: Configure HTTP, gRPC, and metrics endpoints
- **Server CRUD Operations**: Create, read, update, and delete server configurations
- **Persistent Storage**: SQLite database for reliable server configuration storage

### 🤖 Model Management
- **Model Discovery**: Browse all models across your servers
- **Model Information**: View detailed model configurations, including:
  - Platform and backend information
  - Input/output schemas and data types
  - Version policies
  - Instance group configurations
  - Optimization settings
- **Model Statistics**: Monitor inference counts, latency metrics, and performance statistics
- **Model State Tracking**: Visual indicators for model states (ready, loading, unavailable)

### 🧪 Inference Testing
- **Guided Input Forms**: Intelligent form builder that adapts to model input shapes
  - Support for 1D and 2D arrays
  - Dynamic dimension handling
  - Type-aware input validation
- **JSON Input Mode**: Direct JSON input for advanced use cases
- **Input Parsing**: Smart parsing of comma-separated values, JSON arrays, and raw data
- **Real-time Inference**: Execute inference requests and view results instantly
- **Error Handling**: Clear error messages and validation feedback

### 📊 Monitoring & Observability
- **Server Status Dashboard**: Visual status indicators for all servers
- **Model Statistics**: View inference counts, success/failure rates, and latency metrics
- **Health Checks**: Automatic health monitoring with manual refresh options
- **Error Reporting**: Comprehensive error messages and troubleshooting hints

### 🎨 User Experience
- **Modern Dark UI**: Beautiful, developer-friendly dark theme
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Fast Navigation**: Intuitive routing and navigation between servers and models
- **Loading States**: Clear feedback during async operations
- **Empty States**: Helpful messages when no data is available

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm (or pnpm/yarn)
- **NVIDIA Triton Inference Server** (optional, for testing with actual servers)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/triton-studio.git
   cd triton-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The production build will be available in the `build/` directory.

---

## Project Structure

```
triton-studio/
├── app/
│   ├── components/          # React components
│   │   ├── layout/         # Layout components (Header, Sidebar, DashboardLayout)
│   │   ├── ui/            # Reusable UI components (Button, Input, Table, etc.)
│   │   ├── InferenceForm.tsx
│   │   ├── InferencePanel.tsx
│   │   ├── ModelInfoCard.tsx
│   │   └── ModelStatsCard.tsx
│   ├── lib/                # Business logic and utilities
│   │   ├── triton-api.service.ts      # Triton API client
│   │   ├── triton-server.server.ts    # Server CRUD operations
│   │   └── utils.ts                   # Utility functions
│   ├── routes/             # React Router routes
│   │   ├── dashboard.tsx              # Dashboard page
│   │   ├── triton-servers.tsx         # Server list page
│   │   ├── triton-servers.$id.tsx     # Server detail page
│   │   └── triton-servers.$id.models.$modelName.$version.tsx  # Model detail page
│   ├── types/              # TypeScript type definitions
│   ├── db.server.ts        # Database initialization
│   └── root.tsx            # Root layout component
├── package.json
└── README.md
```

---

## Technology Stack

- **Framework**: [React Router v7](https://reactrouter.com/) - Full-stack React framework with server-side rendering
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) - Form validation
- **Tables**: [TanStack Table](https://tanstack.com/table) - Powerful table/data grid
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - Fast SQLite database
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon library

---

## Usage

### Adding a Triton Server

1. Navigate to the **Triton Servers** page
2. Click **Add Server**
3. Fill in the server details:
   - **Name**: A friendly name for your server
   - **HTTP Service URL**: The HTTP endpoint (e.g., `http://localhost:8000`)
   - **gRPC Service URL**: The gRPC endpoint (e.g., `grpc://localhost:8001`)
   - **Metrics Service URL**: The metrics endpoint (e.g., `http://localhost:8002/metrics`)
4. Click **Create**

### Browsing Models

1. Click on a server from the **Triton Servers** list
2. View the list of models available on that server
3. Click on a model to view detailed information

### Testing Inference

1. Navigate to a model's detail page
2. Click the **Run Inference** button (or open the inference panel)
3. Choose between **Guided Form** or **JSON** input mode
4. Fill in the required inputs based on the model's schema
5. Click **Run Inference** to execute the request
6. View the results in the response panel

---

## Development

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

### Database

The application uses SQLite for storing server configurations. The database file (`app.db`) is created automatically on first run.

To reset the database, simply delete the `app.db` file and restart the application.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built for the [NVIDIA Triton Inference Server](https://github.com/triton-inference-server/server) community
- Inspired by the need for better developer tooling in ML inference workflows

---

**Built with ❤️ for the ML engineering community.**
