<div align="center">
  <img src="https://github.com/berkid89/triton-studio/blob/main/public/assets/logo.png" alt="Triton Studio Logo" width="200"/>
</div>

# Triton Studio

**A web-based control plane for NVIDIA Triton Inference Servers.**

Triton Studio provides a comprehensive, user-friendly dashboard for managing Triton Inference Servers, exploring models, and testing inference endpoints. It simplifies the workflow of ML engineers and developers working with production inference deployments.

## Features

### 🖥️ Server Management
- **Multi-Server Support**: Manage multiple Triton Inference Servers from a single dashboard
- **Health Monitoring**: Real-time server status checks (ready/live/not-ready)
- **Service URL Management**: Configure HTTP, gRPC, and metrics endpoints

### 🤖 Model Management
- **Model Discovery**: Browse all models across your servers
- **Model Information**: View detailed model configurations, including platform, backend, input/output schemas, version policies, and optimization settings

### 🧪 Inference Testing
- **Guided Input Forms**: Intelligent form builder that adapts to model input shapes
- **JSON Input Mode**: Direct JSON input for advanced use cases
- **Real-time Inference**: Execute inference requests and view results instantly

### 📊 Monitoring & Observability
- **Server Status Dashboard**: Visual status indicators for all servers
- **Model Statistics**: View inference counts, success/failure rates, and latency metrics

## Quick Start

### Basic Usage

```bash
docker run -d -p 3000:3000 --name triton-studio berkid89/triton-studio:latest
```

Access the application at `http://localhost:3000`.

### Accessing Local Triton Servers

**Linux:**
```bash
docker run -d -p 3000:3000 --network host --name triton-studio berkid89/triton-studio:latest
```

**Windows/Mac:**
Use `host.docker.internal` as the hostname when adding Triton servers in the application (e.g., `http://host.docker.internal:8000`), or use your machine's IP address.

## Configuration

- **Port**: Default port is `3000`. Configure via `PORT` environment variable.
- **Database**: Uses SQLite (stored in `/app/app.db`). For persistence, mount a volume:
  ```bash
  docker run -d -p 3000:3000 -v triton-studio-data:/app/app.db --name triton-studio berkid89/triton-studio:latest
  ```

## License

Apache License 2.0

## Disclaimer

Triton Studio is an independent, open-source project. It is not affiliated with, endorsed by, or sponsored by NVIDIA. NVIDIA and Triton are trademarks of NVIDIA Corporation.

