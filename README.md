# ArXiv Semantic Search Engine 🚀

An end-to-end NLP application that enables semantic "meaning-based" search across 255,748 scholarly articles in Artificial Intelligence and Machine Learning. 



## 🌟 Key Features
- **Semantic Search:** Go beyond keyword matching by using vector embeddings to find papers based on conceptual intent.
- **High-Performance Infrastructure:** Processed 1.7M+ raw records and generated 250k+ embeddings in <2 minutes using an **NVIDIA A100 80GB GPU**.
- **Ultra-Low Latency:** Sub-10ms retrieval time using **FAISS** (Facebook AI Similarity Search).
- **Modern Tech Stack:** Responsive frontend built with **Next.js** and a high-performance **FastAPI** backend.

## 🏗️ Architecture
1. **Data Ingestion:** Filtered the Kaggle ArXiv dataset (1.7M papers) for CS-specific categories using a memory-efficient streaming pipeline.
2. **Vectorization:** Generated 384-dimensional embeddings using the `all-MiniLM-L6-v2` transformer model on the **ASU Sol Supercomputer**.
3. **Indexing:** Optimized a local **FAISS IndexFlatIP** to enable efficient Cosine Similarity search.
4. **API:** A FastAPI server handles query vectorization and interacts with the FAISS index to return metadata-mapped results.

## 🛠️ Tech Stack
- **Frontend:** Next.js, Tailwind CSS
- **Backend:** FastAPI, Uvicorn
- **NLP/ML:** PyTorch, Sentence-Transformers, FAISS, NumPy
- **Infrastructure:** ASU Sol (HPC), NVIDIA A100 GPU

## 🚀 Speed Benchmarks (On NVIDIA A100)
| Task | Quantity | Time |
| :--- | :--- | :--- |
| Data Filtering | 1.7M Records | ~45 Seconds |
| Embedding Generation | 255,748 Papers | ~103 Seconds |
| Search Latency | Top-5 Results | < 5 Milliseconds |

## 📖 How to Run
1. **Clone the repo:** `git clone https://github.com/yourusername/arxiv-semantic-search.git`
2. **Backend Setup:** - `cd backend`
   - `pip install -r requirements.txt`
   - `uvicorn main:app --reload`
3. **Frontend Setup:**
   - `cd frontend`
   - `npm install`
   - `npm run dev`
