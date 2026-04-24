#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_ENV_FILE="${SERVER_ENV_FILE:-$ROOT_DIR/.env.server}"
ENABLE_IPFS_CLUSTER="${ENABLE_IPFS_CLUSTER:-0}"
RESET_DOCKER_STATE="${RESET_DOCKER_STATE:-0}"
AUTO_RUN_MIGRATIONS="${AUTO_RUN_MIGRATIONS:-1}"
COMPOSE_BUILD_PARALLEL_LIMIT="${COMPOSE_BUILD_PARALLEL_LIMIT:-1}"
BUILD_RETRY_ATTEMPTS="${BUILD_RETRY_ATTEMPTS:-3}"
BUILD_RETRY_DELAY_SECONDS="${BUILD_RETRY_DELAY_SECONDS:-15}"
IPFS_DATA_ROOT="${IPFS_DATA_ROOT:-}"

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

compose_cmd=(docker compose)

if [[ -f "$SERVER_ENV_FILE" ]]; then
  compose_cmd+=(--env-file "$SERVER_ENV_FILE")
fi

ensure_env_file "$ROOT_DIR/backend/.env" "$ROOT_DIR/backend/.env.example"
ensure_env_file "$ROOT_DIR/frontend/.env" "$ROOT_DIR/frontend/.env.example"
load_server_env

ENABLE_IPFS_CLUSTER="${ENABLE_IPFS_CLUSTER:-0}"
RESET_DOCKER_STATE="${RESET_DOCKER_STATE:-0}"
AUTO_RUN_MIGRATIONS="${AUTO_RUN_MIGRATIONS:-1}"
COMPOSE_BUILD_PARALLEL_LIMIT="${COMPOSE_BUILD_PARALLEL_LIMIT:-1}"
BUILD_RETRY_ATTEMPTS="${BUILD_RETRY_ATTEMPTS:-3}"
BUILD_RETRY_DELAY_SECONDS="${BUILD_RETRY_DELAY_SECONDS:-15}"
IPFS_DATA_ROOT="${IPFS_DATA_ROOT:-$ROOT_DIR/ipfs-cluster/runtime}"

profile_args=()
if [[ "$ENABLE_IPFS_CLUSTER" == "1" ]]; then
  profile_args+=(--profile ipfs-cluster)
  ensure_directory "$IPFS_DATA_ROOT/node-1"
  ensure_directory "$IPFS_DATA_ROOT/cluster-1"
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

if [[ -n "${ALLOWED_ORIGINS:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "ALLOWED_ORIGINS" "\"${ALLOWED_ORIGINS}\""
fi

if [[ -n "${IPFS_PROVIDER:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_PROVIDER" "\"${IPFS_PROVIDER}\""
fi

if [[ -n "${IPFS_API_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_API_URL" "\"${IPFS_API_URL}\""
fi

if [[ -n "${IPFS_CLUSTER_API_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_CLUSTER_API_URL" "\"${IPFS_CLUSTER_API_URL}\""
fi

if [[ -n "${IPFS_GATEWAY_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "IPFS_GATEWAY_URL" "\"${IPFS_GATEWAY_URL}\""
fi

if [[ -n "${BLOCKCHAIN_RPC_URL:-}" ]]; then
  upsert_env_value "$ROOT_DIR/backend/.env" "BLOCKCHAIN_RPC_URL" "\"${BLOCKCHAIN_RPC_URL}\""
fi

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
  log_step "1/7" "Removing current stack and persistent volumes"
  "${compose_cmd[@]}" "${profile_args[@]}" down -v --remove-orphans
fi

log_step "1/7" "Building Docker images sequentially with retry protection"
for service in hardhat backend frontend; do
  build_service_with_retries "$service" "$BUILD_RETRY_ATTEMPTS" "$BUILD_RETRY_DELAY_SECONDS"
done

base_services=(postgres postfix hardhat)
if [[ "$ENABLE_IPFS_CLUSTER" == "1" ]]; then
  base_services+=(ipfs-node-1 ipfs-node-2 ipfs-node-3 ipfs-cluster)
fi

log_step "2/7" "Starting base infrastructure services"
"${compose_cmd[@]}" "${profile_args[@]}" up -d "${base_services[@]}"

log_step "3/7" "Waiting for PostgreSQL and Hardhat to become healthy"
wait_for_health documentchain-postgres 30 4
wait_for_health documentchain-hardhat 30 4

if [[ "$AUTO_RUN_MIGRATIONS" == "1" ]]; then
  log_step "4/7" "Applying Prisma migrations with the backend image"
  "${compose_cmd[@]}" "${profile_args[@]}" run --rm backend npx prisma migrate deploy --schema=./prisma/schema.prisma
fi

log_step "5/7" "Starting backend and frontend containers"
"${compose_cmd[@]}" "${profile_args[@]}" up -d --remove-orphans backend frontend

log_step "6/7" "Waiting for API and frontend health checks"
wait_for_health documentchain-backend 40 4
wait_for_health documentchain-frontend 30 3

log_step "7/7" "Printing deployed services"
"${compose_cmd[@]}" "${profile_args[@]}" ps

printf '\nDocumentChain updated successfully on the Ubuntu server.\n'
printf 'Frontend: %s\n' "${FRONTEND_URL:-http://localhost:5173}"
printf 'Backend health: http://localhost:3000/health\n'