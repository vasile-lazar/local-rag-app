import os
import requests
import psycopg2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

os.environ["HF_HUB_OFFLINE"] = "1"

app = FastAPI()

# --- Config (from environment, matches your docker-compose.yml) ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", 5432),
    "dbname": os.getenv("DB_NAME", "rag_db"),
    "user": os.getenv("DB_USER", "rag_user"),
    "password": os.getenv("DB_PASSWORD", "rag_password"),
}
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = "llama3.1:8b"

# --- Load the embedding model once at startup, not per-request ---
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# --- Request/response schemas ---
class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 3

class AskRequest(BaseModel):
    query: str
    top_k: int = 3


# --- Core retrieval logic (reused by /retrieve and /ask) ---
def retrieve_chunks(query: str, top_k: int) -> list[dict]:
    query_embedding = embedding_model.encode(query).tolist()

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, text, embedding <=> %s::vector AS distance
        FROM articles
        ORDER BY distance ASC
        LIMIT %s
        """,
        (query_embedding, top_k),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [{"id": r[0], "text": r[1], "distance": r[2]} for r in rows]


# --- Core generation logic (reused by /generate and /ask) ---
def generate_answer(query: str, context_chunks: list[dict]) -> str:
    context_text = "\n\n".join(
        f"[{c['id']}]: {c['text']}" for c in context_chunks
    )

    prompt = f"""You are a legal assistant answering questions about the Moldovan Constitution.
Use ONLY the context below to answer. If the answer isn't in the context, say so clearly.
Cite the article ID(s) you used in your answer.

Context:
{context_text}

Question: {query}

Answer:"""

    response = requests.post(
        f"{OLLAMA_HOST}/api/generate",
        json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
    )
    response.raise_for_status()
    return response.json()["response"]


# --- Endpoints ---
@app.post("/retrieve")
def retrieve(req: RetrieveRequest):
    try:
        results = retrieve_chunks(req.query, req.top_k)
    except psycopg2.OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is unreachable — check that Postgres is running.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    return {"results": results}


@app.post("/ask")
def ask(req: AskRequest):
    try:
        chunks = retrieve_chunks(req.query, req.top_k)
    except psycopg2.OperationalError:
        raise HTTPException(
            status_code=503,
            detail="Database is unreachable — check that Postgres is running.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    try:
        answer = generate_answer(req.query, chunks)
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="The AI model is unavailable — check that Ollama is running.",
        )
    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="The AI model took too long to respond. Try again.",
        )
    except requests.exceptions.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"The AI model returned an error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    return {
        "answer": answer,
        "sources": [{"id": c["id"], "distance": c["distance"]} for c in chunks],
    }


@app.get("/health")
def health():
    return {"status": "ok"}