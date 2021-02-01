IMAGE_NAME=hello-node
CONTAINER_NAME=hello

.PHONY: build

.DEFAULT_GOAL := build

build: ## Build the container
	docker build -t $(IMAGE_NAME) .

run: ## Run the container in a docker environment
	docker run --name $(CONTAINER_NAME) -p8080:8080 -d --rm $(IMAGE_NAME)

test: ## Query the test container
	curl -i "http://localhost:8080"

stop: ## Stop the container
	docker stop $(CONTAINER_NAME)

rmi: ## Remove the container image
	docker rmi $(IMAGE_NAME)
