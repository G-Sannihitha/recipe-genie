# scripts/embed_recipes.py

import os
import csv
import json
import numpy as np

# Directory for saving embeddings
EMBED_DIR = "data/embeddings"
os.makedirs(EMBED_DIR, exist_ok=True)

def embed_text(text):
    """
    Mock embedding function.
    Replace this with real LLM embeddings (OpenAI / HuggingFace etc.)
    """
    # For demo, return a fixed-size random vector
    return np.random.rand(768).tolist()

def main():
    csv_path = "data/recipes.csv"
    embeddings = []

    # Open CSV with utf-8-sig to remove BOM automatically
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Compose document text
            doc = f"{row['name']}\nIngredients: {row['ingredients']}\nSteps: {row['steps']}"

            # Generate embedding
            vector = embed_text(doc)

            embeddings.append({
                "name": row['name'],
                "category": row.get("category", ""),
                "doc": doc,
                "embedding": vector
            })

    # Save embeddings to JSON
    out_path = os.path.join(EMBED_DIR, "recipe_embeddings.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(embeddings, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(embeddings)} embeddings to {out_path}")

if __name__ == "__main__":
    main()
