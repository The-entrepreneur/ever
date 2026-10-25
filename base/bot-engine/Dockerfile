FROM node:20-alpine

WORKDIR /app

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
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "index.js"]
