<div align="center">
  <img src="public/assets/logo.png" alt="Triton Studio Logo" width="200"/>
</div>

# Triton Studio

**A web-based control plane for NVIDIA Triton Inference Servers.**

Triton Studio provides a comprehensive, user-friendly dashboard for managing Triton Inference Servers, exploring models, and testing inference endpoints. It simplifies the workflow of ML engineers and developers working with production inference deployments.

---

## Why use Triton Studio?

Triton Studio helps developers and ML engineers manage and interact with Triton Inference Servers through an intuitive web interface, eliminating the need for complex command-line tools or custom scripts.

Use Triton Studio for:

* **Centralized Server Management**. Manage multiple Triton Inference Servers from a single interface. Add, edit, and monitor servers with real-time health status checks. Keep track of all your inference infrastructure in one place.

* **Model Discovery & Inspection**. Browse models across all your servers, view detailed model configurations, inspect input/output schemas, and understand model capabilities without diving into configuration files.

* **Interactive Inference Testing**. Test your models directly from the browser with an intelligent form builder that adapts to model input shapes. Switch between guided forms and raw JSON input for maximum flexibility.

* **Real-time Monitoring**. Monitor server health status, view model statistics, and track inference performance metrics. Get instant visibility into your inference infrastructure.

---

## Features

### 🖥️ Server Management
- **Multi-Server Support**: Manage multiple Triton Inference Servers from a single dashboard
- **Health Monitoring**: Real-time server status checks (ready/live/not-ready)
- **Service URL Management**: Configure HTTP, gRPC, and metrics endpoints

### 🤖 Model Management
- **Model Discovery**: Browse all models across your servers
- **Model Information**: View detailed model configurations, including:
  - Platform and backend information
  - Input/output schemas and data types
  - Version policies
  - Instance group configurations
  - Optimization settings
  - Model statistics

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

---

## Planned Features

We're continuously working to enhance Triton Studio with new capabilities. Here's what's coming next:

### 🗄️ Database & Infrastructure
- **External Database Support**: Support for PostgreSQL, MySQL, and other production-grade databases beyond SQLite, enabling better scalability and multi-instance deployments
- **Database Migrations**: Automated schema migration tools for seamless database upgrades

### 📤 File Upload & Media Support
- **File Upload for Inference**: Direct file upload support for inference requests, including:
  - Image files (PNG, JPEG, WebP) for computer vision models
  - Audio files (WAV, MP3, FLAC) for speech and audio processing models
  - Automatic file encoding and preprocessing for model compatibility
- **Batch File Processing**: Upload and process multiple files in a single inference request

### 📈 Enhanced Dashboard & Analytics
- **Advanced Dashboard**: Comprehensive analytics dashboard with:
  - Historical performance trends and metrics visualization
  - Model usage statistics and heatmaps
  - Server resource utilization monitoring
  - Customizable dashboard widgets
- **Inference History**: Track and review past inference requests with search and filtering capabilities
- **Performance Benchmarking**: Automated performance testing tools to compare model versions and configurations

### 🔄 Automation & Integration
- **Model Deployment Automation**: Automated workflows for model deployment and version management
- **Webhooks & Notifications**: Configurable webhooks for server status changes and inference events
- **Export/Import Configurations**: Backup and restore server configurations, including bulk import/export capabilities
- **REST API**: Full REST API for programmatic access to all Triton Studio features

### 🧩 Advanced Features
- **Model Version Comparison**: Side-by-side comparison of model versions, configurations, and performance metrics
- **Batch Inference Support**: Native support for batch inference requests with optimized processing
- **Custom Metrics Integration**: Integration with external monitoring systems (Prometheus, Grafana, etc.)
- **Model Registry Integration**: Connect with ML model registries for seamless model discovery and deployment

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

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built for the [NVIDIA Triton Inference Server](https://github.com/triton-inference-server/server) community
- Inspired by the need for better developer tooling in ML inference workflows

---

## Disclaimer

Triton Studio is an independent, open-source project.
It is not affiliated with, endorsed by, or sponsored by NVIDIA.
NVIDIA and Triton are trademarks of NVIDIA Corporation.

---

**Built with ❤️ for the ML engineering community.**
