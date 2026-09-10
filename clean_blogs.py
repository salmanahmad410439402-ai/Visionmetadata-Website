import sys
import re

filepath = r'C:\Users\Salman Ahmad\Music\Visionmetadata-Website-main\src\pages\Blogs.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove all instances of the SEO useEffect block
# Let's use a regex to aggressively strip out the entire blocks
block_pattern = r"  // Update document title and meta for SEO when viewing a post\s*useEffect\(\(\) => \{.*?\n  \}, \[currentPost\]\);\s*"
content = re.sub(block_pattern, "", content, flags=re.DOTALL)

# Also strip out the old activePost ones if they exist
block_pattern_old = r"  // Update document title and meta for SEO when viewing a post\s*useEffect\(\(\) => \{.*?\n  \}, \[activePost\]\);\s*"
content = re.sub(block_pattern_old, "", content, flags=re.DOTALL)

# 2. Re-inject exactly ONE block right before `return (`
effect_code = """
  // Update document title and meta for SEO when viewing a post
  useEffect(() => {
    if (currentPost) {
      document.title = currentPost.title + ' | Tagyfy Blog';
      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', currentPost.summary);
    } else {
      document.title = 'Stock Contributor Knowledge Base | Tagyfy';
    }
  }, [currentPost]);

"""
content = content.replace("  return (", effect_code + "  return (", 1)

# 3. Add useEffect to the React import
if "useEffect" not in content[:500]:
    content = content.replace('import { useState', 'import { useState, useEffect')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed Blogs.tsx')
