FROM python:3.11-slim

WORKDIR /app

# System deps for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install app deps + gunicorn (production WSGI server)
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 5001

ENV FLASK_APP=app.main
ENV FLASK_ENV=production

# Gunicorn: 2 workers, bind on all interfaces, 120s timeout for slow queries
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5001", \
     "--workers", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "app.main:create_app()"]
