#!/usr/bin/env python3
"""Repair dangling 'The/the <verb>' artifacts left by strip-lecture-refs.py."""
import json, re

PATH = "data/questions/Generated-PA165.json"

# Specific question rewrites
QUESTION_FIXES = {
    "How does the describe the Spring Framework?":
        "How would you describe the Spring Framework?",
    "How does the distinguish the DAO pattern from the Repository pattern?":
        "How does the DAO pattern differ from the Repository pattern?",
    "How does the define a 'service mesh'?":
        "How would you define a 'service mesh'?",
    "Which password hashing/storage approach does the recommend an identity provider should use?":
        "Which password hashing/storage approach should an identity provider use?",
    "How does the distinguish CI/CD from DevOps?":
        "How does CI/CD differ from DevOps?",
}

# Verbs that signal a missing subject ("the slides/lecture <verb>").
VERBS = (
    "lists?|states?|shows?|defines?|describes?|covers?|presents?|recommends?|"
    "outlines?|illustrates?|notes?|mentions?|explains?|quotes?|requires?|"
    "provides?|emphasi[sz]es?|introduces?|teach(?:es)?|discusses?|"
    "specif(?:y|ies|ied)|specifically"
)

START_PAT = re.compile(rf"^The\s+({VERBS})\b", re.M)
MID_PAT = re.compile(rf"(?<!^)\b[Tt]he\s+({VERBS})\b")

def fix_explanation(text):
    if not text:
        return text
    # "The lists ..." at start → "Lists ..." (cap)
    text = START_PAT.sub(lambda m: m.group(1).capitalize(), text)
    # mid-sentence "the lists" → "it lists"
    text = MID_PAT.sub(lambda m: "it " + m.group(1).lower(), text)
    # fix "specifically" if it got mangled
    text = re.sub(r"\bSpecifically\b\s+(\w)", lambda m: "Specifically, " + m.group(1), text)
    return text

with open(PATH) as f:
    qs = json.load(f)

changed = 0
for q in qs:
    if q["question"] in QUESTION_FIXES:
        q["question"] = QUESTION_FIXES[q["question"]]
        changed += 1
    new_exp = fix_explanation(q.get("explanation"))
    if new_exp != q.get("explanation"):
        q["explanation"] = new_exp
        changed += 1

with open(PATH, "w") as f:
    json.dump(qs, f, indent=2, ensure_ascii=False)
    f.write("\n")

print(f"Fixed {changed} fields")
