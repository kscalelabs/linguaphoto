# LinguaPhoto

## Getting Started

First, start localstack, which lets you run AWS locally.

Next, create tables using the command:

```bash
python -m linguaphoto.db
```

Run the backend using the command:

```bash
uvicorn linguaphoto.main:app --reload
```

Finally, run the frontend using the command:

```bash
cd frontend
npm start
```
