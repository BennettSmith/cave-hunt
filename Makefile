.PHONY: fmt test vet build run

fmt:
	go fmt ./...

test:
	go test ./...

vet:
	go vet ./...

build:
	go build ./...

run:
	go run ./cmd/cave-hunt
