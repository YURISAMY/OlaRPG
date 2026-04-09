with open("Livro base.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if '<div class="skill ' in line:
        # Check the previous non-empty line
        # but since we are modifying, we can just look back a bit
        # Actually simplest format:
        prev = lines[i-1].strip()
        if prev and not prev.endswith('</div>') and not prev.endswith('</div></div>') and 'card-skills' not in prev and '<!--' not in prev:
            # We found a line like '          <div class="skill-desc">Some desc...'
            # We need to append '</div></div>' to the end of the previous line!
            # Since lines[i-1] has the newline character at the end, we can replace it.
            lines[i-1] = lines[i-1].rstrip('\r\n') + '</div></div>\n'
            
    new_lines.append(line)

with open("Livro base.html", "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Fixed missing divs")
