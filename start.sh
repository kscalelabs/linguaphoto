#!/bin/bash

# Navigate to the frontend, install dependencies, and build it
cd frontend
npm install
npm run build

# Start serving the frontend (you might use a static server like serve)
npx serve -s build &

# Navigate to the backend, install dependencies, and start the server
cd ../linguaphoto
pip install -r requirements.txt
fastapi run --port 8080