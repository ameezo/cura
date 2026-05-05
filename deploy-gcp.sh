#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# Cura — Google Cloud Deployment Script
# Project: cura-962
#
# Run this INSIDE Google Cloud Shell after:
#   git clone https://github.com/ameezo/cura.git
#   cd cura
#   bash deploy-gcp.sh
#
# Cost estimate (db-f1-micro): ~$9-12/month for Cloud SQL
# Cloud Run: FREE tier covers ~2M requests/month
# Vertex AI: Pay-per-token (~$0.075/1M input tokens for Gemini Flash)
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on any error

# ── Configuration ─────────────────────────────────────────────────────────────
export PROJECT_ID="cura-962"
export REGION="us-central1"
export DB_INSTANCE="cura-db"
export DB_NAME="medical_app"
export DB_USER="cura_user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}ℹ️  $1${NC}"; }
ok()    { echo -e "${GREEN}✅ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()   { echo -e "${RED}❌ $1${NC}"; }

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 1: Project & API Setup
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 1: Setting up GCP Project & APIs"
echo "═══════════════════════════════════════════════════════════════"

gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

info "Enabling required APIs (this may take a minute)..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  --quiet

ok "All APIs enabled"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 2: Artifact Registry
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 2: Creating Artifact Registry"
echo "═══════════════════════════════════════════════════════════════"

if gcloud artifacts repositories describe cura-repo --location=$REGION &>/dev/null; then
    ok "Artifact Registry 'cura-repo' already exists"
else
    gcloud artifacts repositories create cura-repo \
      --repository-format=docker \
      --location=$REGION \
      --description="Cura Docker images" \
      --quiet
    ok "Artifact Registry 'cura-repo' created"
fi

gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet
ok "Docker configured for Artifact Registry"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 3: Cloud SQL (Postgres)
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 3: Setting up Cloud SQL (Postgres)"
echo "═══════════════════════════════════════════════════════════════"

# Generate a random DB password
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(24))")
FLASK_SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")

if gcloud sql instances describe $DB_INSTANCE --quiet &>/dev/null; then
    warn "Cloud SQL instance '$DB_INSTANCE' already exists — skipping creation"
else
    info "Creating Cloud SQL instance (this takes 3-5 minutes)..."
    gcloud sql instances create $DB_INSTANCE \
      --database-version=POSTGRES_16 \
      --tier=db-f1-micro \
      --edition=ENTERPRISE \
      --region=$REGION \
      --root-password="$DB_PASSWORD" \
      --quiet
    ok "Cloud SQL instance created"
fi

# Create database (ignore if exists)
gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE --quiet 2>/dev/null || true
ok "Database '$DB_NAME' ready"

# Create user (ignore if exists)
gcloud sql users create $DB_USER \
  --instance=$DB_INSTANCE \
  --password="$DB_PASSWORD" \
  --quiet 2>/dev/null || true
ok "Database user '$DB_USER' ready"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 4: Secrets
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 4: Storing Secrets"
echo "═══════════════════════════════════════════════════════════════"

# Helper to create or update a secret
store_secret() {
    local name=$1
    local value=$2
    if gcloud secrets describe "$name" --quiet &>/dev/null; then
        echo -n "$value" | gcloud secrets versions add "$name" --data-file=- --quiet
        ok "Secret '$name' updated"
    else
        echo -n "$value" | gcloud secrets create "$name" --data-file=- --quiet
        ok "Secret '$name' created"
    fi
}

store_secret "db-password" "$DB_PASSWORD"
store_secret "flask-secret-key" "$FLASK_SECRET"

# Store Groq API key (read from .env or prompt)
GROQ_KEY="${GROQ_API_KEY:-}"
if [ -z "$GROQ_KEY" ] && [ -f .env ]; then
    GROQ_KEY=$(grep "^GROQ_API_KEY=" .env | cut -d'=' -f2)
fi
if [ -n "$GROQ_KEY" ]; then
    store_secret "groq-api-key" "$GROQ_KEY"
else
    warn "GROQ_API_KEY not found — creating placeholder 'empty_key' so deployment doesn't fail."
    store_secret "groq-api-key" "empty_key"
    info "You can add your real Groq key later with:"
    echo "    echo -n 'YOUR_KEY' | gcloud secrets versions add groq-api-key --data-file=-"
fi

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 5: IAM Permissions
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 5: Configuring IAM Permissions"
echo "═══════════════════════════════════════════════════════════════"

# Get project number for the default compute service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SA_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

info "Granting permissions to $SA_EMAIL"

# Vertex AI access (for AI Chat)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/aiplatform.user" \
  --quiet --condition=None 2>/dev/null
ok "Vertex AI User role granted"

# Cloud SQL access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudsql.client" \
  --quiet --condition=None 2>/dev/null
ok "Cloud SQL Client role granted"

# Secret Manager access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet --condition=None 2>/dev/null
ok "Secret Manager Accessor role granted"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 6: Build & Push Docker Images
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 6: Building & Pushing Docker Images"
echo "═══════════════════════════════════════════════════════════════"

IMAGE_BASE="${REGION}-docker.pkg.dev/${PROJECT_ID}/cura-repo"

info "Building backend image..."
docker build -t ${IMAGE_BASE}/cura-backend:latest ./backend
docker push ${IMAGE_BASE}/cura-backend:latest
ok "Backend image pushed"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 7: Deploy Backend to Cloud Run
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 7: Deploying Backend to Cloud Run"
echo "═══════════════════════════════════════════════════════════════"

SQL_CONNECTION=$(gcloud sql instances describe $DB_INSTANCE --format='value(connectionName)')

info "Deploying backend..."
gcloud run deploy cura-backend \
  --image=${IMAGE_BASE}/cura-backend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --add-cloudsql-instances=$SQL_CONNECTION \
  --set-env-vars="POSTGRES_HOST=/cloudsql/${SQL_CONNECTION}" \
  --set-env-vars="POSTGRES_USER=${DB_USER}" \
  --set-env-vars="POSTGRES_DB=${DB_NAME}" \
  --set-env-vars="POSTGRES_PORT=5432" \
  --set-env-vars="FLASK_ENV=production" \
  --set-env-vars="FLASK_DEBUG=0" \
  --set-env-vars="AI_CHAT_ENABLED=true" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --set-env-vars="GOOGLE_CLOUD_LOCATION=${REGION}" \
  --set-env-vars="GEMINI_MODEL=gemini-2.5-flash" \
  --set-env-vars="GROQ_MODEL=llama-3.1-8b-instant" \
  --set-secrets="POSTGRES_PASSWORD=db-password:latest" \
  --set-secrets="SECRET_KEY=flask-secret-key:latest" \
  --set-secrets="GROQ_API_KEY=groq-api-key:latest" \
  --port=5001 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --timeout=300 \
  --quiet

BACKEND_URL=$(gcloud run services describe cura-backend --region=$REGION --format='value(status.url)')
ok "Backend deployed: $BACKEND_URL"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 8: Build & Deploy Frontend
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 8: Building & Deploying Frontend"
echo "═══════════════════════════════════════════════════════════════"

info "Building frontend image with API URL: ${BACKEND_URL}/api/v1"
docker build \
  --build-arg VITE_API_BASE_URL=${BACKEND_URL}/api/v1 \
  -t ${IMAGE_BASE}/cura-frontend:latest \
  ./frontend

docker push ${IMAGE_BASE}/cura-frontend:latest
ok "Frontend image pushed"

info "Deploying frontend..."
gcloud run deploy cura-frontend \
  --image=${IMAGE_BASE}/cura-frontend:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=3 \
  --quiet

FRONTEND_URL=$(gcloud run services describe cura-frontend --region=$REGION --format='value(status.url)')
ok "Frontend deployed: $FRONTEND_URL"

# ══════════════════════════════════════════════════════════════════════════════
# PHASE 9: Update Backend CORS with Frontend URL
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Phase 9: Updating CORS Configuration"
echo "═══════════════════════════════════════════════════════════════"

gcloud run services update cura-backend \
  --region=$REGION \
  --update-env-vars="FRONTEND_URL=${FRONTEND_URL}" \
  --quiet
ok "Backend CORS updated with frontend URL"

# ══════════════════════════════════════════════════════════════════════════════
# DONE
# ══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎉 Deployment Complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "  ${GREEN}Frontend:${NC}  $FRONTEND_URL"
echo -e "  ${GREEN}Backend:${NC}   $BACKEND_URL"
echo -e "  ${GREEN}Health:${NC}    $BACKEND_URL/health"
echo ""
echo -e "  ${BLUE}AI Chat:${NC}   Vertex AI (primary) → Gemini API → Groq"
echo -e "  ${BLUE}Database:${NC}  Cloud SQL ($DB_INSTANCE)"
echo -e "  ${BLUE}Project:${NC}   $PROJECT_ID"
echo ""
echo "  Test it:"
echo "    curl $BACKEND_URL/health"
echo ""
echo "═══════════════════════════════════════════════════════════════"
