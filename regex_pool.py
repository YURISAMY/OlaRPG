import re

with open("Livro base.html", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Remove pool-label and pool-grid wrappers
# Basically, replace `<div class="pool-section">` ... `<div class="pool-label">...</div>` ... `<div class="pool-grid">` with nothing
# And remove the closing `</div>\s*</div>` for them.

# First, extract the content of pool-grid and then replace the whole section with just the content.
def replacer(match):
    content = match.group(1)
    # Replace pool-skill with skill
    content = content.replace("pool-skill", "skill")
    return content

pattern = r'<div class="pool-section">\s*<div class="pool-label">[^<]*</div>\s*<div class="pool-grid">([\s\S]*?)</div>\s*</div>'
text = re.sub(pattern, replacer, text)

# Just in case there are nested pool-grid that I missed due to greediness.
# Wait, pool-grid doesn't have nested divs that could break the regex if it ends early?
# Since pool-grid contains pool-skills which contains divs, `([\s\S]*?)</div>\s*</div>` will stop at the first `</div> </div>`, which might be inside a skill if it has exactly two closing divs.
# Let's write a safer parser or use beautifulsoup-like regex.
