#!/bin/bash

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker-compose exec -T db mysqladmin ping -h localhost --silent; do
  echo -n "."
  sleep 1
done
echo " Database is ready!"

# Run migrations
echo "Running migrations..."
docker-compose exec -T backend go run cmd/migrate/main.go

# Seed database
echo "Seeding database..."
docker-compose exec -T backend go run cmd/seed/main.go

echo "Setup complete!"