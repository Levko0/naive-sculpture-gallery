export PATH := /opt/homebrew/bin:$(PATH)
export SAM_CLI_TELEMETRY := 0

.PHONY: help install test dev dev-backend dev-frontend build deploy-infra deploy-frontend deploy clean

STACK_NAME ?= naive-sculpture-gallery
AWS_REGION ?= eu-central-1
ARTIST_EMAIL ?= artist@naive-sculptures.art

help:
	@echo "🎨 Naive Art Sculpture Gallery & Storefront — Makefile"
	@echo "=========================================================="
	@echo "Available commands:"
	@echo "  make install        - Install backend (.venv) and frontend dependencies"
	@echo "  make test           - Run backend unit tests with pytest"
	@echo "  make dev-backend    - Run FastAPI backend locally (port 8000)"
	@echo "  make dev-frontend   - Run Vite frontend dev server (port 5173)"
	@echo "  make dev            - Run both backend and frontend concurrently"
	@echo "  make build          - Build production assets (Vite dist + SAM build)"
	@echo "  make deploy-infra   - Deploy serverless infrastructure via AWS SAM"
	@echo "  make deploy-frontend- Sync frontend dist to S3 and invalidate CloudFront"
	@echo "  make deploy         - Full deployment: test, build, deploy infra & frontend"
	@echo "  make clean          - Remove build artifacts and temporary files"

install:
	@echo "📦 Installing backend dependencies..."
	cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt pytest
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install

test:
	@echo "🧪 Running backend unit tests..."
	cd backend && PYTHONPATH=. .venv/bin/pytest -v

dev-backend:
	@echo "🚀 Starting backend on http://localhost:8000..."
	cd backend && .venv/bin/python run_local.py

dev-frontend:
	@echo "⚡ Starting frontend on http://localhost:5173..."
	cd frontend && npm run dev

dev:
	@echo "✨ Starting local development environment..."
	npx concurrently -k -n "backend,frontend" -c "blue,green" \
		"cd backend && .venv/bin/python run_local.py" \
		"cd frontend && npm run dev"

build: test
	@echo "🔨 Building frontend SPA bundle..."
	cd frontend && npm run build
	@echo "🔨 Building SAM serverless package..."
	cd infra && sam build --region $(AWS_REGION)

deploy-infra:
	@echo "☁️ Deploying AWS SAM Stack: $(STACK_NAME)..."
	cd infra && sam deploy \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--capabilities CAPABILITY_IAM \
		--parameter-overrides \
			Environment="prod" \
			ArtistNotificationEmail="$(ARTIST_EMAIL)" \
		--resolve-s3 \
		--no-confirm-changeset

deploy-frontend:
	@echo "🚀 Syncing frontend to S3 and invalidating CloudFront..."
	@BUCKET_NAME=$$(aws cloudformation describe-stacks --stack-name $(STACK_NAME) --region $(AWS_REGION) --query "Stacks[0].Outputs[?OutputKey=='GalleryBucketName'].OutputValue" --output text); \
	DIST_ID=$$(aws cloudformation describe-stack-resources --stack-name $(STACK_NAME) --region $(AWS_REGION) --query "StackResources[?ResourceType=='AWS::CloudFront::Distribution'].PhysicalResourceId" --output text); \
	echo "Target Bucket: $$BUCKET_NAME"; \
	echo "Target Distribution: $$DIST_ID"; \
	aws s3 sync frontend/dist s3://$$BUCKET_NAME --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"; \
	aws s3 cp frontend/dist/index.html s3://$$BUCKET_NAME/index.html --cache-control "no-cache, no-store, must-revalidate"; \
	aws cloudfront create-invalidation --distribution-id $$DIST_ID --paths "/*"
	@echo "✅ Frontend deployment complete!"

deploy: test build deploy-infra deploy-frontend
	@echo "🎉 Naive Art Sculpture Gallery successfully deployed to AWS Free Tier!"

clean:
	rm -rf frontend/dist
	rm -rf infra/.aws-sam
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
