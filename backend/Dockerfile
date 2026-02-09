FROM python:3.12-slim-bookworm
WORKDIR /app

# install build deps for mysqlclient if needed
RUN apt-get update -o Acquire::ForceIPv4=true && \
    apt-get install -y --no-install-recommends \
    build-essential pkg-config default-libmysqlclient-dev libssl-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy backend sources (use .dockerignore to skip venv, __pycache__, etc.)
COPY . .

EXPOSE 8000
# wait for DB to become ready, then start the app
CMD ["sh", "-c", "python wait_for_db.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]