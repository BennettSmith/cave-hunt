.DEFAULT_GOAL := help

.PHONY: help setup fmt fmt-check test vet build check check-opencode-guard run

## help: Show available development commands.
help:
	@awk 'BEGIN { FS = ": " } /^## [a-zA-Z0-9_.-]+: / { target = substr($$1, 4); printf "%-22s %s\n", target, $$2 }' $(MAKEFILE_LIST)

## setup: Activate and validate tracked Git hooks for this clone.
setup:
	@test -d .githooks
	@test ! -L .githooks
	@test -f .githooks/pre-commit
	@test ! -L .githooks/pre-commit
	@test -x .githooks/pre-commit
	@test -f .githooks/check
	@test ! -L .githooks/check
	@test -x .githooks/check
	@git ls-files --error-unmatch .githooks/pre-commit >/dev/null
	@git ls-files --error-unmatch .githooks/check >/dev/null
	@git config --local core.hooksPath .githooks
	@test "$$(git config --local --get core.hooksPath)" = ".githooks"
	@printf "Git hooks activated for this clone.\n"

## fmt: Format Go source files.
fmt:
	go fmt ./...

## fmt-check: Check Go formatting without modifying files.
fmt-check:
	@.githooks/check fmt

## test: Run all Go tests.
test:
	go test ./...

## vet: Run Go static analysis.
vet:
	go vet ./...

## build: Build all Go packages and commands.
build:
	go build ./...

## check: Run the repository-owned commit gate.
check:
	@.githooks/check

## check-opencode-guard: Test the OpenCode-specific commit bypass guard.
check-opencode-guard:
	node --test .opencode/tests/*.test.mjs

## run: Run the game.
run:
	go run ./cmd/cave-hunt
