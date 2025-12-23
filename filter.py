import json
from datetime import datetime, timedelta, timezone


INPUT_PATH = 'archive\\arxiv-metadata-oai-snapshot.json'
OUTPUT_PATH = 'filtered_arxiv_metadata.json'

TARGET_CATEGORIES = {'cs.AI', 'cs.CL','cs.LG'}
def parse_date(record):
    """Parse a date string into a datetime object."""
    ud = record.get('update_date')
    if ud:
        try:
            return datetime.fromisoformat(ud).replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    
    versions = record.get('versions', [])
    
    if versions:
        created = versions[-1].get('created')
        if created:
            for fmt in ("%a, %d %b %Y %H:%M:%S %Z", "%a, %d %b %Y %H:%M:%S GMT"):
                try:
                    return datetime.strptime(created, fmt).replace(tzinfo=timezone.utc)
                except ValueError:
                    continue

    return None

kept = 0
seen = 0

with open(INPUT_PATH, 'r', encoding='utf-8') as fin, open(OUTPUT_PATH, 'w', encoding='utf-8') as fout:
    for line in fin:
        seen += 1
        line = line.strip()
        if not line:
            continue
        record = json.loads(line)

        category = (record.get('categories') or '').split()
        if not any (c in TARGET_CATEGORIES for c in category):
            continue
        dt = parse_date(record)
        if dt is None or dt < datetime(2022, 1, 1, tzinfo=timezone.utc):
            continue
        
        fout.write(json.dumps(record) + '\n')
        kept += 1
print(f"Processed {seen} records, kept {kept} records.")