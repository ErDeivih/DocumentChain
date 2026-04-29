#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_ENV_FILE="${SERVER_ENV_FILE:-$ROOT_DIR/.env.server}"
ENABLE_IPFS_NODE="${ENABLE_IPFS_NODE:-0}"
RESET_DOCKER_STATE="${RESET_DOCKER_STATE:-0}"
AUTO_RUN_MIGRATIONS="${AUTO_RUN_MIGRATIONS:-1}"
AUTO_RESEED_QA="${AUTO_RESEED_QA:-0}"
SEED_PROFILE="${SEED_PROFILE:-qa-fast}"
REQUIRE_SMTP_RELAY="${REQUIRE_SMTP_RELAY:-0}"
COMPOSE_BUILD_PARALLEL_LIMIT="${COMPOSE_BUILD_PARALLEL_LIMIT:-1}"
BUILD_RETRY_ATTEMPTS="${BUILD_RETRY_ATTEMPTS:-3}"
BUILD_RETRY_DELAY_SECONDS="${BUILD_RETRY_DELAY_SECONDS:-15}"
IPFS_DATA_ROOT="${IPFS_DATA_ROOT:-}"

secret_placeholder_pattern='(change-this|your-secret-key|your-super-secret|genera_un_secret|otro_secret_diferente|secure-random-string)'

log_step() {
  printf '\n[%s] %s\n' "$1" "$2"
}

require_command() {
  local command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  fi
}

ensure_env_file() {
  local target_file="$1"
  local example_file="$2"

  if [[ -f "$target_file" ]]; then
    return
  fi

  if [[ ! -f "$example_file" ]]; then
    printf 'Missing example env file: %s\n' "$example_file" >&2
    exit 1
  fi

  cp "$example_file" "$target_file"
}

ensure_directory() {
  local dir_path="$1"

  if [[ -z "$dir_path" ]]; then
    return
  fi

  mkdir -p "$dir_path"
}

upsert_env_value() {
  local file_path="$1"
  local key="$2"
  local value="$3"
  local escaped_value

  escaped_value=$(printf '%s' "$value" | sed 's/[&/\\]/\\&/g')

  if grep -qE "^${key}=" "$file_path"; then
    sed -i "s/^${key}=.*/${key}=${escaped_value}/" "$file_path"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$file_path"
  fi
}

generate_secure_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi

  if command -v node >/dev/null 2>&1; then
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    return
  fi

  printf 'Unable to generate a secure secret automatically: neither openssl nor node is available\n' >&2
  exit 1
}

extract_email_domain() {
  local email_address="$1"

  if [[ "$email_address" != *"@"* ]]; then
    printf ''
    return
  fi

  printf '%s' "${email_address##*@}" | tr '[:upper:]' '[:lower:]'
}

is_local_email_domain() {
  local email_domain="$1"
  [[ "$email_domain" == "localhost" || "$email_domain" == *.local ]]
}

ensure_persistent_secret() {
  local secret_name="$1"
  local secret_value="${!secret_name:-}"

  if [[ -n "$secret_value" ]] && (( ${#secret_value} >= 32 )) && [[ ! "$secret_value" =~ $secret_placeholder_pattern ]]; then
    export "$secret_name=$secret_value"
    return
  fi

  local generated_secret
  generated_secret="$(generate_secure_secret)"
  upsert_env_value "$SERVER_ENV_FILE" "$secret_name" "$generated_secret"
  export "$secret_name=$generated_secret"
  printf 'Generated persistent secret %s in %s\n' "$secret_name" "$SERVER_ENV_FILE"
}

wait_for_health() {
  local container_name="$1"
  local attempts="${2:-30}"
  local delay_seconds="${3:-4}"

  for ((attempt=1; attempt<=attempts; attempt++)); do
    local status
    status=$(docker inspect "$container_name" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' 2>/dev/null || true)

    if [[ "$status" == "healthy" || "$status" == "running" ]]; then
      return
    fi

    sleep "$delay_seconds"
  done

  printf 'Container %s did not become healthy\n' "$container_name" >&2
  exit 1
}

build_service_with_retries() {
  local service_name="$1"
  local max_attempts="$2"
  local delay_seconds="$3"
  local attempt

  for ((attempt=1; attempt<=max_attempts; attempt++)); do
    printf 'Building %s (attempt %d/%d)\n' "$service_name" "$attempt" "$max_attempts"

    if COMPOSE_PARALLEL_LIMIT="$COMPOSE_BUILD_PARALLEL_LIMIT" \
      "${compose_cmd[@]}" "${profile_args[@]}" build "$service_name"; then
      return
    fi

    if (( attempt == max_attempts )); then
      printf 'Docker build failed for %s after %d attempts\n' "$service_name" "$max_attempts" >&2
      exit 1
    fi

    printf 'Retrying %s in %d seconds after a transient build failure\n' "$service_name" "$delay_seconds" >&2
    sleep "$delay_seconds"
  done
}

load_server_env() {
  if [[ ! -f "$SERVER_ENV_FILE" ]]; then
    return
  fi

  set -a
  # shellcheck disable=SC1090
  source "$SERVER_ENV_FILE"
  set +a
}

load_repo_env_fallback() {
  local repo_env_file="$1"

  if [[ ! -f "$repo_env_file" ]]; then
    return
  fi

  while IFS='=' read -r key raw_value; do
    if [[ -z "$key" || "$key" =~ ^# ]]; then
      continue
    fi

    if [[ "$key" =~ [[:space:]] ]]; then
      continue
    fi

    if [[ -n "${!key:-}" ]]; then
      continue
    fi

    local value="$raw_value"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"

    export "$key=$value"
  done < "$repo_env_file"
}

capture_runtime_env_overrides() {
  RUNTIME_FRONTEND_URL="${FRONTEND_URL:-}"
  RUNTIME_ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-}"
  RUNTIME_VITE_API_URL="${VITE_API_URL:-}"
  RUNTIME_VITE_BLOCKCHAIN_RPC_URL="${VITE_BLOCKCHAIN_RPC_URL:-}"
  RUNTIME_EMAIL_FROM="${EMAIL_FROM:-}"
  RUNTIME_EMAIL_FROM_NAME="${EMAIL_FROM_NAME:-}"
  RUNTIME_SMTP_HOST="${SMTP_HOST:-}"
  RUNTIME_SMTP_PORT="${SMTP_PORT:-}"
  RUNTIME_SMTP_SECURE="${SMTP_SECURE:-}"
  RUNTIME_SMTP_USER="${SMTP_USER:-}"
  RUNTIME_SMTP_PASS="${SMTP_PASS:-}"
  RUNTIME_SMTP_RELAYHOST="${SMTP_RELAYHOST:-}"
  RUNTIME_SMTP_RELAYHOST_USERNAME="${SMTP_RELAYHOST_USERNAME:-}"
  RUNTIME_SMTP_RELAYHOST_PASSWORD="${SMTP_RELAYHOST_PASSWORD:-}"
  RUNTIME_POSTFIX_SMTP_TLS_SECURITY_LEVEL="${POSTFIX_SMTP_TLS_SECURITY_LEVEL:-}"
  RUNTIME_POSTFIX_HOSTNAME="${POSTFIX_HOSTNAME:-}"
  RUNTIME_ALLOWED_SENDER_DOMAINS="${ALLOWED_SENDER_DOMAINS:-}"
  RUNTIME_MASQUERADED_DOMAINS="${MASQUERADED_DOMAINS:-}"
  RUNTIME_BLOCKCHAIN_RPC_URL="${BLOCKCHAIN_RPC_URL:-}"
  RUNTIME_CONTRACT_DOCUMENT_REGISTRY="${CONTRACT_DOCUMENT_REGISTRY:-}"
  RUNTIME_IPFS_PROVIDER="${IPFS_PROVIDER:-}"
  RUNTIME_IPFS_API_URL="${IPFS_API_URL:-}"
  RUNTIME_IPFS_GATEWAY_URL="${IPFS_GATEWAY_URL:-}"
  RUNTIME_IPFS_DATA_ROOT="${IPFS_DATA_ROOT:-}"
}

apply_runtime_override() {
  local var_name="$1"
  local runtime_value="$2"

  if [[ -z "$runtime_value" ]]; then
    return
  fi

  export "$var_name=$runtime_value"
  upsert_env_value "$SERVER_ENV_FILE" "$var_name" "$runtime_value"
}

apply_runtime_env_overrides() {
  apply_runtime_override "FRONTEND_URL" "$RUNTIME_FRONTEND_URL"
  apply_runtime_override "ALLOWED_ORIGINS" "$RUNTIME_ALLOWED_ORIGINS"
  apply_runtime_override "VITE_API_URL" "$RUNTIME_VITE_API_URL"
  apply_runtime_override "VITE_BLOCKCHAIN_RPC_URL" "$RUNTIME_VITE_BLOCKCHAIN_RPC_URL"
  apply_runtime_override "EMAIL_FROM" "$RUNTIME_EMAIL_FROM"
  apply_runtime_override "EMAIL_FROM_NAME" "$RUNTIME_EMAIL_FROM_NAME"
  apply_runtime_override "SMTP_HOST" "$RUNTIME_SMTP_HOST"
  apply_runtime_override "SMTP_PORT" "$RUNTIME_SMTP_PORT"
  apply_runtime_override "SMTP_SECURE" "$RUNTIME_SMTP_SECURE"
  apply_runtime_override "SMTP_USER" "$RUNTIME_SMTP_USER"
  apply_runtime_override "SMTP_PASS" "$RUNTIME_SMTP_PASS"
  apply_runtime_override "SMTP_RELAYHOST" "$RUNTIME_SMTP_RELAYHOST"
  apply_runtime_override "SMTP_RELAYHOST_USERNAME" "$RUNTIME_SMTP_RELAYHOST_USERNAME"
  apply_runtime_override "SMTP_RELAYHOST_PASSWORD" "$RUNTIME_SMTP_RELAYHOST_PASSWORD"
  apply_runtime_override "POSTFIX_SMTP_TLS_SECURITY_LEVEL" "$RUNTIME_POSTFIX_SMTP_TLS_SECURITY_LEVEL"
  apply_runtime_override "POSTFIX_HOSTNAME" "$RUNTIME_POSTFIX_HOSTNAME"
  apply_runtime_override "ALLOWED_SENDER_DOMAINS" "$RUNTIME_ALLOWED_SENDER_DOMAINS"
  apply_runtime_override "MASQUERADED_DOMAINS" "$RUNTIME_MASQUERADED_DOMAINS"
  apply_runtime_override "BLOCKCHAIN_RPC_URL" "$RUNTIME_BLOCKCHAIN_RPC_URL"
  apply_runtime_override "CONTRACT_DOCUMENT_REGISTRY" "$RUNTIME_CONTRACT_DOCUMENT_REGISTRY"
  apply_runtime_override "IPFS_PROVIDER" "$RUNTIME_IPFS_PROVIDER"
  apply_runtime_override "IPFS_API_URL" "$RUNTIME_IPFS_API_URL"
  apply_runtime_override "IPFS_GATEWAY_URL" "$RUNTIME_IPFS_GATEWAY_URL"
  apply_runtime_override "IPFS_DATA_ROOT" "$RUNTIME_IPFS_DATA_ROOT"
}

require_secure_secret() {
  local secret_name="$1"
  local secret_value="${!secret_name:-}"

  if [[ -z "$secret_value" ]]; then
    printf 'Missing required secret in %s: %s\n' "$SERVER_ENV_FILE" "$secret_name" >&2
    exit 1
  fi

  if (( ${#secret_value} < 32 )); then
    printf 'Secret %s must be at least 32 characters long\n' "$secret_name" >&2
    exit 1
  fi

  if [[ "$secret_value" =~ $secret_placeholder_pattern ]]; then
    printf 'Secret %s still uses a placeholder value in %s\n' "$secret_name" "$SERVER_ENV_FILE" >&2
    exit 1
  fi
}

require_mail_delivery_configuration() {
  local smtp_host="${SMTP_HOST:-postfix}"
  local email_from="${EMAIL_FROM:-}"
  local sender_domain

  sender_domain="$(extract_email_domain "$email_from")"

  if [[ -z "$email_from" || -z "$sender_domain" ]]; then
    printf 'EMAIL_FROM must be configured with a real sender address in %s\n' "$SERVER_ENV_FILE" >&2
    exit 1
  fi

  if is_local_email_domain "$sender_domain"; then
    printf 'EMAIL_FROM must not use a local domain when REQUIRE_SMTP_RELAY=1 (%s)\n' "$email_from" >&2
    exit 1
  fi

  if [[ "$smtp_host" == "postfix" ]]; then
    if [[ -z "${SMTP_RELAYHOST:-}" || -z "${SMTP_RELAYHOST_USERNAME:-}" || -z "${SMTP_RELAYHOST_PASSWORD:-}" ]]; then
      printf 'SMTP relay is required but SMTP_RELAYHOST/SMTP_RELAYHOST_USERNAME/SMTP_RELAYHOST_PASSWORD are missing in %s\n' "$SERVER_ENV_FILE" >&2
      exit 1
    fi
  else
    if [[ -z "${SMTP_USER:-}" || -z "${SMTP_PASS:-}" ]]; then
      printf 'Direct SMTP mode requires SMTP_USER and SMTP_PASS in %s\n' "$SERVER_ENV_FILE" >&2
      exit 1
    fi
  fi
}

compose_cmd=(docker compose)

if [[ -f "$SERVER_ENV_FILE" ]]; then
  compose_cmd+=(--env-file "$SERVER_ENV_FILE")
fi

ensure_env_file "$ROOT_DIR/backend/.env" "$ROOT_DIR/backend/.env.example"
ensure_env_file "$ROOT_DIR/frontend/.env" "$ROOT_DIR/frontend/.env.example"
ensure_env_file "$SERVER_ENV_FILE" "$ROOT_DIR/.env.server.example"
capture_runtime_env_overrides
load_server_env
load_repo_env_fallback "$ROOT_DIR/.env"
capture_runtime_env_overrides
apply_runtime_env_overrides

EMAIL_DOMAIN="$(extract_email_domain "${EMAIL_FROM:-}")"

if [[ -n "$EMAIL_DOMAIN" ]]; then
  if [[ -z "${ALLOWED_SENDER_DOMAINS:-}" || "${ALLOWED_SENDER_DOMAINS}" == "documentchain.local" ]]; then
    upsert_env_value "$SERVER_ENV_FILE" "ALLOWED_SENDER_DOMAINS" "$EMAIL_DOMAIN"
    export ALLOWED_SENDER_DOMAINS="$EMAIL_DOMAIN"
  fi

  if [[ -z "${MASQUERADED_DOMAINS:-}" || "${MASQUERADED_DOMAINS}" == "documentchain.local" ]]; then
    upsert_env_value "$SERVER_ENV_FILE" "MASQUERADED_DOMAINS" "$EMAIL_DOMAIN"
    export MASQUERADED_DOMAINS="$EMAIL_DOMAIN"
  fi

  if [[ -z "${POSTFIX_HOSTNAME:-}" || "${POSTFIX_HOSTNAME}" == "mail.documentchain.local" ]]; then
    upsert_env_value "$SERVER_ENV_FILE" "POSTFIX_HOSTNAME" "mail.${EMAIL_DOMAIN}"
    export POSTFIX_HOSTNAME="mail.${EMAIL_DOMAIN}"
  fi
fi

if [[ -z "${EMAIL_FROM:-}" ]]; then
  printf 'Warning: EMAIL_FROM is not set in %s; outbound verification emails may use a non-deliverable sender.\n' "$SERVER_ENV_FILE" >&2
elif is_local_email_domain "$EMAIL_DOMAIN"; then
  printf 'Warning: EMAIL_FROM uses a local domain (%s); external email delivery will not be reliable.\n' "$EMAIL_FROM" >&2
fi

if [[ -z "${SMTP_RELAYHOST:-}" && "${SMTP_HOST:-postfix}" == "postfix" ]]; then
  printf 'Warning: SMTP_RELAYHOST is not configured; outbound delivery will depend on the server MTA reputation and DNS.\n' >&2
fi

ensure_persistent_secret "JWT_SECRET"
ensure_persistent_secret "JWT_REFRESH_SECRET"
ensure_persistent_secret "ADMIN_REGISTRATION_SECRET"

require_secure_secret "JWT_SECRET"
require_secure_secret "JWT_REFRESH_SECRET"
require_secure_secret "ADMIN_REGISTRATION_SECRET"

ENABLE_IPFS_NODE="${ENABLE_IPFS_NODE:-0}"
RESET_DOCKER_STATE="${RESET_DOCKER_STATE:-0}"
AUTO_RUN_MIGRATIONS="${AUTO_RUN_MIGRATIONS:-1}"
AUTO_RESEED_QA="${AUTO_RESEED_QA:-0}"
SEED_PROFILE="${SEED_PROFILE:-qa-fast}"
REQUIRE_SMTP_RELAY="${REQUIRE_SMTP_RELAY:-0}"
COMPOSE_BUILD_PARALLEL_LIMIT="${COMPOSE_BUILD_PARALLEL_LIMIT:-1}"
BUILD_RETRY_ATTEMPTS="${BUILD_RETRY_ATTEMPTS:-3}"
BUILD_RETRY_DELAY_SECONDS="${BUILD_RETRY_DELAY_SECONDS:-15}"
IPFS_DATA_ROOT="${IPFS_DATA_ROOT:-$ROOT_DIR/ipfs/runtime}"

if [[ "$REQUIRE_SMTP_RELAY" == "1" ]]; then
  require_mail_delivery_configuration
fi

profile_args=()
if [[ "$ENABLE_IPFS_NODE" == "1" ]]; then
  profile_args+=(--profile ipfs)
  ensure_directory "$IPFS_DATA_ROOT/node"
fi

require_command docker
require_command git

if [[ "$AUTO_RUN_MIGRATIONS" == "1" ]]; then
  require_command node
  require_command npm
fi

if [[ -n "${FRONTEND_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "FRONTEND_URL" "\"${FRONTEND_URL}\""
fi

if [[ -n "${EMAIL_FROM:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "EMAIL_FROM" "\"${EMAIL_FROM}\""
fi

if [[ -n "${EMAIL_FROM_NAME:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "EMAIL_FROM_NAME" "\"${EMAIL_FROM_NAME}\""
fi

if [[ -n "${SMTP_HOST:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "SMTP_HOST" "\"${SMTP_HOST}\""
fi

if [[ -n "${SMTP_PORT:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "SMTP_PORT" "\"${SMTP_PORT}\""
fi

if [[ -n "${SMTP_SECURE:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "SMTP_SECURE" "\"${SMTP_SECURE}\""
fi

if [[ -n "${SMTP_USER:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "SMTP_USER" "\"${SMTP_USER}\""
fi

if [[ -n "${SMTP_PASS:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "SMTP_PASS" "\"${SMTP_PASS}\""
fi

if [[ -n "${ALLOWED_ORIGINS:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "ALLOWED_ORIGINS" "\"${ALLOWED_ORIGINS}\""
fi

if [[ -n "${IPFS_PROVIDER:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_PROVIDER" "\"${IPFS_PROVIDER}\""
fi

if [[ -n "${IPFS_API_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_API_URL" "\"${IPFS_API_URL}\""
fi

if [[ -n "${IPFS_GATEWAY_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_GATEWAY_URL" "\"${IPFS_GATEWAY_URL}\""
fi

if [[ -n "${BLOCKCHAIN_RPC_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "BLOCKCHAIN_RPC_URL" "\"${BLOCKCHAIN_RPC_URL}\""
fi

upsert_env_value "$ROOT_DIR/backend/.env" "JWT_SECRET" "\"${JWT_SECRET}\""
upsert_env_value "$ROOT_DIR/backend/.env" "JWT_REFRESH_SECRET" "\"${JWT_REFRESH_SECRET}\""
upsert_env_value "$ROOT_DIR/backend/.env" "ADMIN_REGISTRATION_SECRET" "\"${ADMIN_REGISTRATION_SECRET}\""

if [[ -n "${CONTRACT_DOCUMENT_REGISTRY:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "CONTRACT_DOCUMENT_REGISTRY" "\"${CONTRACT_DOCUMENT_REGISTRY}\""
  upsert_env_value "$ROOT_DIR/frontend/.env" "VITE_CONTRACT_REGISTRY" "${CONTRACT_DOCUMENT_REGISTRY}"
fi

if [[ -n "${VITE_API_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/frontend/.env" "VITE_API_URL" "${VITE_API_URL}"
fi

if [[ -n "${VITE_BLOCKCHAIN_RPC_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/frontend/.env" "VITE_BLOCKCHAIN_RPC_URL" "${VITE_BLOCKCHAIN_RPC_URL}"
fi

if [[ "$RESET_DOCKER_STATE" == "1" ]]; then
  log_step "1/8" "Removing current stack and persistent volumes"
  "${compose_cmd[@]}" "${profile_args[@]}" down -v --remove-orphans
fi

log_step "1/8" "Building Docker images sequentially with retry protection"
for service in hardhat backend frontend; do
  build_service_with_retries "$service" "$BUILD_RETRY_ATTEMPTS" "$BUILD_RETRY_DELAY_SECONDS"
done

base_services=(postgres postfix hardhat)
if [[ "$ENABLE_IPFS_NODE" == "1" ]]; then
  base_services+=(ipfs-node)
fi

log_step "2/8" "Starting base infrastructure services"
"${compose_cmd[@]}" "${profile_args[@]}" up -d --remove-orphans "${base_services[@]}"

log_step "3/8" "Waiting for PostgreSQL and Hardhat to become healthy"
wait_for_health documentchain-postgres 30 4
wait_for_health documentchain-hardhat 30 4

if [[ "$AUTO_RUN_MIGRATIONS" == "1" ]]; then
  log_step "4/8" "Applying Prisma migrations with the backend image"
  "${compose_cmd[@]}" "${profile_args[@]}" run --rm backend npx prisma migrate deploy --schema=./prisma/schema.prisma
fi

if [[ "$AUTO_RESEED_QA" == "1" ]]; then
  log_step "5/8" "Resetting database and generating QA seed profile (${SEED_PROFILE})"
  "${compose_cmd[@]}" "${profile_args[@]}" run --rm \
    -e SEED_PROFILE="$SEED_PROFILE" \
    -v "$ROOT_DIR/backend/scripts:/app/scripts:ro" \
    -v "$ROOT_DIR/backend/src:/app/src:ro" \
    backend npm run data:seed:qa
fi

log_step "6/8" "Starting backend and frontend containers"
"${compose_cmd[@]}" "${profile_args[@]}" up -d --remove-orphans backend frontend

log_step "7/8" "Waiting for API and frontend health checks"
wait_for_health documentchain-backend 40 4
wait_for_health documentchain-frontend 30 3

log_step "8/8" "Printing deployed services"
"${compose_cmd[@]}" "${profile_args[@]}" ps

printf '\nDocumentChain updated successfully on the Ubuntu server.\n'
printf 'Frontend: %s\n' "${FRONTEND_URL:-http://localhost:5173}"
printf 'Backend health: http://localhost:3000/health\n'