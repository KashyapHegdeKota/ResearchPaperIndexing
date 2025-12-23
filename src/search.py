import pickle
import faiss
from sentence_transformers import SentenceTransformer

# 1. Load the metadata lists back into memory
with open("/scratch/kkota3/nlp/metadata.pkl", "rb") as f:
    metadata = pickle.load(f)
    ids = metadata["ids"]
    search_texts = metadata["titles"]

# 2. Load the index and model
model = SentenceTransformer("all-MiniLM-L6-v2")
index = faiss.read_index("/scratch/kkota3/nlp/arxiv_filtered_faiss.index")

# 3. Now search_papers will have access to 'ids'
def search_papers(query, k=5):
    query_vec = model.encode([query], normalize_embeddings=True).astype('float32')
    D, I = index.search(query_vec, k)
    
    for i in range(k):
        res_idx = I[0][i]
        paper_id = ids[res_idx]
        
        print(f"[{i+1}] RELEVANCE: {D[0][i]:.4f}")
        print(f"TITLE: {search_texts[res_idx].split('. ')[0]}") # Splits title from abstract
        print(f"LINK: https://arxiv.org/abs/{paper_id}")
        print(f"SUMMARY: {search_texts[res_idx].split('. ')[1][:300]}...") # Show first 300 chars of abstract
        print("-" * 50)

search_papers("Efficient training of LLMs on NVIDIA GPUs")