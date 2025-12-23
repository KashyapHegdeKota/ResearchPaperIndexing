import json
import re
import torch 
from sentence_transformers import SentenceTransformer
import faiss
import pickle
INP = "filtered_arxiv_metadata.json"

_ws = re.compile(r"\s+")
def normalize(s: str) -> str:
    return _ws.sub(" ", (s or "").replace("\n", " ").strip())

search_texts = []
ids = []  # optional, useful to map results back

with open(INP, "r", encoding="utf-8") as fin:
    for line in fin:
        r = json.loads(line)
        title = normalize(r.get("title", ""))
        abstract = normalize(r.get("abstract", ""))
        search_texts.append(f"{title}. {abstract}" if abstract else title)
        ids.append(r.get("id"))


device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")
model = SentenceTransformer("all-MiniLM-L6-v2", device=device)

embeddings = model.encode(
    search_texts,
    batch_size = 128,
    show_progress_bar = True,
    convert_to_tensor = True,
    normalize_embeddings = True
)

print(embeddings)
embeddings_arr = embeddings.cpu().numpy().astype("float32")
dimension = embeddings_arr.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings_arr)
print(f"Indexed {index.ntotal} vectors of dimension {dimension}.")
faiss.write_index(index, "arxiv_filtered_faiss.index")


# Save the lists so search.py can use them later
with open("/scratch/kkota3/nlp/metadata.pkl", "wb") as f:
    pickle.dump({"ids": ids, "titles": search_texts}, f)
print("Metadata saved successfully!")