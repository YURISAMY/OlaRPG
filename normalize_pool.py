import re

with open("Livro base.html", "r", encoding="utf-8") as f:
    text = f.read()

# First blind replace of the pool prefixes to standard names
text = text.replace('pool-skill-header', 'skill-header')
text = text.replace('pool-skill-name', 'skill-name')
text = text.replace('pool-skill-type', 'skill-type')
text = text.replace('pool-skill-cost', 'skill-cost')
text = text.replace('pool-skill-desc', 'skill-desc')
text = text.replace('pool-skill-req', 'skill-req')
text = text.replace('pool-skill', 'skill')

# The missing div problem usually looks like:
# <div class="skill-desc">Some text.
#         <div class="skill passive">
# Let's fix missing divs by observing if <div class="skill "> directly follows text inside <div class="skill-desc"> without </div>.

# Actually, the user's insertions were all previously "pool-skill".
# We can search for the line before where "pool-skill" was originally. 
# But let's just do a robust check.

with open("Livro base.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Renamed all pool skills to normal skills.")
