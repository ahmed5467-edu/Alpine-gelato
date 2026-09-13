#!/bin/bash
set -e
npm install
npm run db:push --workspace @workspace/db
