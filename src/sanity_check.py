import json
from collections import Counter

PATH = "filtered_arxiv_metadata.json"
TARGET = {"cs.AI", "cs.CL", "cs.LG"}

only_target = 0
has_target_plus_other = 0
counts = Counter()
total = 0

with open(PATH, "r", encoding="utf-8") as f:
    for line in f:
        r = json.loads(line)
        total += 1
        cats = set((r.get("categories") or "").split())
        hit = cats & TARGET
        if not hit:
            continue

        for c in hit:
            counts[c] += 1

        if cats <= TARGET:
            only_target += 1
        else:
            has_target_plus_other += 1

print(f"Total: {total:,}")
print("Target hits:", dict(counts))
print(f"Only target cats: {only_target:,}")
print(f"Target + other cats: {has_target_plus_other:,}")
