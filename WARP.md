# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Python FastAPI backend (skeleton) located under Backend/expenses-approvals-ocr.

Quick commands

- Activate the virtual environment (Windows PowerShell):
  - .\venv\Scripts\Activate.ps1
  - Note: venv\Scripts\activate is for bash; in PowerShell use Activate.ps1.
- Install dependencies:
  - pip install -r Backend/expenses-approvals-ocr/requirements.txt
  - requirements.txt is currently empty; if you add packages during development, update it with: pip freeze > Backend/expenses-approvals-ocr/requirements.txt
- Run the API locally (from Backend/expenses-approvals-ocr):
  - python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  - Open API docs: http://127.0.0.1:8000/docs
- Linting:
  - No linter is configured in this repo (no ruff/flake8 config found).
- Tests:
  - No tests or test framework are present in the repo at this time.

Architecture overview

- Entry point: app/main.py
  - Creates the FastAPI application and registers routers.
  - Route prefixes:
    - /api/expenses → app/routes/expenses.py
    - /api/ocr → app/routes/ocr.py
  - Root health endpoint / returns a simple JSON message.
- Routers
  - app/routes/expenses.py
    - REST-style skeleton endpoints:
      - GET /api/expenses/
      - POST /api/expenses/
      - GET /api/expenses/{expense_id}
      - PUT /api/expenses/{expense_id}
      - DELETE /api/expenses/{expense_id}
    - Handlers currently return placeholder JSON.
  - app/routes/ocr.py
    - POST /api/ocr/upload accepts an UploadFile for receipt upload.
    - POST /api/ocr/process accepts an UploadFile for OCR processing.
    - GET /api/ocr/status/{job_id} returns placeholder job status.
- Models and services (currently stubs)
  - app/models/expense_model.py: define Pydantic models (empty at present).
  - app/services/ocr_service.py: OCR logic placeholder.
  - app/services/exchange_service.py: currency/exchange logic placeholder.
  - app/utils/helpers.py: shared utilities placeholder.
- Dependencies
  - Backend/expenses-approvals-ocr/requirements.txt exists but is empty. The checked-in venv/ suggests FastAPI and related libs are used, but dependency management should be tracked in requirements.txt for reproducibility.

Common development flows

- Add or modify endpoints
  - Define route handlers in app/routes/*.py.
  - Register or adjust router prefixes in app/main.py.
  - Place non-trivial logic in app/services/*; keep route handlers thin.
- Add request/response schemas
  - Define pydantic models in app/models/expense_model.py (or additional modules under app/models/).
- Hitting endpoints locally (examples)
  - Expenses list: curl http://127.0.0.1:8000/api/expenses/
  - Upload OCR file:
    - curl -F "file=@/absolute/path/to/receipt.jpg" http://127.0.0.1:8000/api/ocr/upload

Repository docs and rules

- README.md: minimal title only.
- No CLAUDE.md, Cursor rules, or GitHub Copilot instructions files were found.
