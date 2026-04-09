import re

with open("Livro base.html", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'(?s)<div class="pool-section">\s*<div class="pool-label">.*?</div>\s*<div class="pool-grid">(.*?)</div>\s*</div>'

def replacer(match):
    content = match.group(1)
    
    # Replace all pool- prefixes inside content
    content = content.replace('pool-skill-header', 'skill-header')
    content = content.replace('pool-skill-name', 'skill-name')
    content = content.replace('pool-skill-type', 'skill-type')
    content = content.replace('pool-skill-cost', 'skill-cost')
    content = content.replace('pool-skill-desc', 'skill-desc')
    content = content.replace('pool-skill-req', 'skill-req')
    content = content.replace('pool-skill', 'skill')
    
    return content

text, num_subs = re.subn(pattern, replacer, text)

with open("Livro base.html", "w", encoding="utf-8") as f:
    f.write(text)

print(f"Converted {num_subs} pool-sections to normal skills.")
