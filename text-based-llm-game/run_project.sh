#!/bin/bash

# Start Stable Diffusion
echo "Starting Stable Diffusion..."
cd ~/AI-Tools/stable-diffusion-webui
python3 launch.py --api &  # Run in the background

# Wait a bit for Stable Diffusion to start
sleep 15

# Start Next.js
echo "Starting Next.js..."
cd ~/your-nextjs-project
npm run dev

