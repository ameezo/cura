FROM python:3.11-slim

WORKDIR /app

# System deps:
#   libpq-dev + gcc → needed to compile psycopg2
#   postgresql-client → provides pg_isready for the entrypoint health check
RUN apt-get update && \
    apt-get install -y libpq-dev gcc postgresql-client && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install app deps + gunicorn (production WSGI server)
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

# Make the entrypoint executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 5001

ENV FLASK_APP=app.main
ENV FLASK_ENV=production

# entrypoint.sh: waits for DB → runs migrations → starts Gunicorn
ENTRYPOINT ["/app/entrypoint.sh"]
