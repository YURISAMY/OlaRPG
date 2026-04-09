import re

with open("Livro base.html", "r", encoding="utf-8") as f:
    text = f.read()

# We look for <div class="skill-desc">... that does not end with </div> before a new <div class="skill
pattern = r'(<div class="skill-desc">((?!</div>).)*?)\s*<div class="skill'
matches = re.finditer(r'(?s)(<div class="skill-desc">.*?)\s*<div class="skill', text)

# Actually a safer way: check all occurrences of `<div class="skill `
# and line before it.
lines = text.split('\n')
for i, line in enumerate(lines):
    if '<div class="skill ' in line:
        # Check lines before it
        prev = lines[i-1].strip()
        if not prev.endswith('</div>') and prev != '' and not prev.startswith('<!--') and not prev.endswith('</div></div>'):
            print(f"Line {i+1}: {line.strip()}")
            print(f"Previous: {prev}")
