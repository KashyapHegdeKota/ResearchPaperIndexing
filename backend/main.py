import os
import pickle
import faiss
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI(title = "ArXiv Paper Search API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_NAME = "all-MiniLM-L6-v2"
INDEX_PATH = os.path.join(BASE_DIR, "arxiv_filtered_faiss.index")
METADATA_PATH = os.path.join(BASE_DIR, "metadata.pkl")

model = SentenceTransformer(MODEL_NAME)
index = None
ids = None
titles = None

@app.on_event("startup")
def load_resources():
    global model, index, ids, titles
    print("Loading model...")
    print("Loading FAISS index...")
    index = faiss.read_index(INDEX_PATH)
    print("Loading metadata...")
    with open(METADATA_PATH, "rb") as f:
        metadata = pickle.load(f)
        ids = metadata["ids"]
        titles = metadata["titles"]
    print("Resources loaded successfully.")
class SearchRequest(BaseModel):
    query: str
    k: int = 5

@app.post("/search")
async def search(request: SearchRequest):
    if not model or not index:
        raise HTTPException(status_code=503, detail="Model or index not loaded.")
    query_vec = model.encode([request.query], normalize_embeddings=True).astype('float32')
    D, I = index.search(query_vec, request.k)

    results = []
    for i in range(len(I[0])):
        res_idx = I[0][i]
        paper_id = ids[res_idx]
        title = titles[res_idx].split('. ')[0]
        abstract = titles[res_idx].split('. ')[1] if '. ' in titles[res_idx] else ""
        results.append({
            "rank": i + 1,
            "relevance": float(D[0][i]),
            "title": title,
            "link": f"https://arxiv.org/abs/{paper_id}",
            "summary": abstract[:300] + "..." if len(abstract) > 300 else abstract
        })

    return {"results": results}
handler = Mangum(app)