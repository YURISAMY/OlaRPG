with open("Livro base.html", "r", encoding="utf-8") as f:
    text = f.read()

# Instead of complex regex for balanced divs, just replace the strings!
# Because the user literally pasted them exactly the same way.

text = text.replace('<div class="pool-section">', '')
text = text.replace('<div class="pool-label">✦ Pool de Progressão Horizontal</div>', '')
text = text.replace('<div class="pool-label">✦ Pool de ProgressÃ£o Horizontal</div>', '')
text = text.replace('<div class="pool-label">âœ¦ Pool de ProgressÃ£o Horizontal</div>', '')
text = text.replace('<div class="pool-grid">', '')

text = text.replace('<div class="pool-skill', '<div class="skill-divider"></div>\n<div class="skill')
text = text.replace('pool-skill-header', 'skill-header')
text = text.replace('pool-skill-name', 'skill-name')
text = text.replace('pool-skill-type', 'skill-type')
text = text.replace('pool-skill-cost', 'skill-cost')
text = text.replace('pool-skill-desc', 'skill-desc')
text = text.replace('pool-skill-req', 'skill-req')

# Oh wait, if I just remove `<div class="pool-section">` and `<div class="pool-grid">`, there are two extra `</div>` at the end of each block!
# </div>\s*</div> that close grid and section.
# We can find them: after the last `</skill>`, there will be `</div> </div>` before the next `</div><!-- end card-skills -->`?
# Actually, the easiest way is to read line by line and track state, or use BeautifulSoup. Since the user doesn't have it installed natively on this project... Wait, I can just install it!
