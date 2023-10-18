PHONY: build
build:
	docker buildx build --push --platform linux/amd64,linux/arm64 -t tkgling/chatgpt-discord-bot:latest .