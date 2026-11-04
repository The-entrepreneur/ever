FROM --platform=linux/amd64 node:20-slim

WORKDIR /app

# Configure npm timeout and retries for network resilience
ENV NPM_CONFIG_FETCH_TIMEOUT=120000
ENV NPM_CONFIG_FETCH_RETRIES=5

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create credentials directory for optional runtime volume injection
RUN mkdir -p /app/credentials

# Pre-download ONNX model at build time to prevent cold-start delay during RAG semantic search
RUN node -e "const { pipeline } = require('@xenova/transformers'); pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2').then(() => console.log('ONNX model cached successfully')).catch(console.error)"

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "index.js"]
