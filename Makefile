.PHONY: build run test clean migrate seed dev

build:
	go build -o bin/api cmd/api/main.go

run:
	go run cmd/api/main.go

test:
	go test -v ./...

clean:
	rm -rf bin/

migrate:
	go run cmd/migrate/main.go

seed:
	go run cmd/seed/main.go

dev:
	air

deps:
	go mod download
	go mod tidy

lint:
	golangci-lint run

fmt:
	go fmt ./...