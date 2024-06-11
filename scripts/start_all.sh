#!/bin/sh
# Starts the databases, frontend and backend.

set -e

cur_dir=$(realpath $(dirname $0))
root_dir=$(realpath $(dirname $cur_dir))

docker_log=${cur_dir}/docker.log
backend_log=${cur_dir}/backend.log
frontend_log=${cur_dir}/frontend.log

# Define cleanup function
cleanup() {
    echo "Stopping databases..."
    docker-compose -f ${cur_dir}/docker-compose.yml down
    echo "Killing FastAPI..."
    kill $backend_pid || true
    echo "Killing React..."
    kill $frontend_pid || true
    echo "Waiting for services to stop..."
    wait $docker_compose_pid
    wait $backend_pid
    wait $frontend_pid
    echo "Services stopped."
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Starts docker and gets the pid
docker-compose -f ${cur_dir}/docker-compose.yml up > $docker_log 2>&1 &
docker_compose_pid=$!

# Starts FastAPI and gets the pid
fastapi dev ${root_dir}/linguaphoto/main.py --port 8080 > $backend_log 2>&1 &
backend_pid=$!

# Starts React and gets the pid
cd ${root_dir}/frontend
npm start > $frontend_log 2>&1 &
frontend_pid=$!

# Wait for user to press enter
echo "====================================="
echo "Docker, FastAPI and React are running"
echo "     Visit http://localhost:3000     "
echo "====================================="

read -p "Press enter to stop the services"

# Exits
exit 0
