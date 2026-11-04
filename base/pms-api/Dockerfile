FROM --platform=linux/amd64 python:3.11-slim

WORKDIR /app

# Configure pip timeout and retry thresholds to withstand slow or unstable connections
ENV PIP_DEFAULT_TIMEOUT=120
ENV PIP_RETRIES=5

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import httpx; httpx.get('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
