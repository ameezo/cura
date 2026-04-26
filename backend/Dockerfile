FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port
EXPOSE 5000

ENV FLASK_APP=app.main
ENV FLASK_RUN_HOST=0.0.0.0

# Start app
CMD ["flask", "run"]
