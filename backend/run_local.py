"""
Local development server runner for Naive Art Sculpture Gallery backend.
Runs FastAPI with hot-reloading on port 8000.
"""
import os
import uvicorn

if __name__ == "__main__":
    os.environ.setdefault("USE_LOCAL_MOCK_DATA", "true")
    os.environ.setdefault("ENVIRONMENT", "dev")
    print("🎨 Starting Naive Art Sculpture Gallery Backend on http://localhost:8000 ...")
    print("📖 Swagger UI Docs: http://localhost:8000/api/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
