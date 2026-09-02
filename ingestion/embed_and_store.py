import json
import psycopg2
from sentence_transformers import SentenceTransformer

CHUNKS_PATH = "data/chunks.json"
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "rag_db",
    "user": "rag_user",
    "password": "rag_password",
}

def main():
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    model = SentenceTransformer("all-MiniLM-L6-v2")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    for chunk in chunks:
        embedding = model.encode(chunk["text"]).tolist()  # numpy array -> plain list
        cur.execute(
            """
            INSERT INTO articles (id, text, embedding)
            VALUES (%s, %s, %s)
            ON CONFLICT (id) DO UPDATE
            SET text = EXCLUDED.text, embedding = EXCLUDED.embedding
            """,
            (chunk["id"], chunk["text"], embedding),
        )

    conn.commit()
    cur.close()
    conn.close()
    print(f"Inserted/updated {len(chunks)} chunks into Postgres.")

if __name__ == "__main__":
    main()