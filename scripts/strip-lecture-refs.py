#!/usr/bin/env python3
"""Remove "in the lecture" / "according to the slides" / etc. from question text."""
import json, re, sys

PATH = "data/questions/Generated-PA165.json"

# Order matters: longer / specific patterns first so the trailing ",? in the lecture" rule
# doesn't eat the prefix half of "as shown in the lecture".
PATTERNS = [
    r",?\s*\bas\s+(?:shown|covered|defined|deprecated|described|listed|presented|quoted|summarized|given|stated|noted|mentioned|outlined|highlighted|illustrated|introduced|emphasi[sz]ed|explained|taught|discussed)\s+(?:in|on|by|throughout)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bas\s+(?:shown|covered|defined|deprecated|described|listed|presented|quoted|summarized|given|stated|noted|mentioned|outlined|highlighted|illustrated|introduced|emphasi[sz]ed|explained|taught|discussed)\b",
    r",?\s*\baccording\s+to\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bper\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bfrom\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\b(?:in|on|during|throughout)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bbased\s+on\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bcovered\s+(?:in|on|by)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bshown\s+(?:in|on)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bpresented\s+(?:in|on)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bdiscussed\s+(?:in|on)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\bdescribed\s+(?:in|on)\s+(?:the\s+)?(?:lecture|slides?|deck|presentation|class|course)s?\b",
    r",?\s*\b(?:lecture|slide|deck|presentation|class|course)s?\b",
]

def clean(text):
    if not text:
        return text
    for p in PATTERNS:
        text = re.sub(p, "", text, flags=re.I)
    # tidy: collapse spaces, fix spaces-before-punct and orphan commas
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\s+([,.?!:;])", r"\1", text)
    text = re.sub(r",(\s*[?.!])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    text = re.sub(r"\(\s*\)", "", text)
    return text.strip(" ,")

with open(PATH) as f:
    qs = json.load(f)

changed = 0
for q in qs:
    for k in ("question", "explanation"):
        v = q.get(k)
        if v is None:
            continue
        new = clean(v)
        # ensure question ends with proper terminator (it must be non-empty)
        if k == "question" and new and not new.endswith(("?", ".", "!", ":")):
            new = new + "?"
        if new != v:
            q[k] = new
            changed += 1
    for o in q["options"]:
        v = o["text"]
        new = clean(v)
        if new != v:
            o["text"] = new

with open(PATH, "w") as f:
    json.dump(qs, f, indent=2, ensure_ascii=False)
    f.write("\n")
print(f"Cleaned {changed} text fields across {len(qs)} questions")
