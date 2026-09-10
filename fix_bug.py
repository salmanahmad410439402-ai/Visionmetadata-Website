import sys

filepath = r'C:\Users\Salman Ahmad\Music\Visionmetadata-Website-main\src\pages\Blogs.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('if (activePost) {', 'if (currentPost) {')
content = content.replace('document.title = activePost.title', 'document.title = currentPost.title')
content = content.replace("meta.setAttribute('content', activePost.summary);", "meta.setAttribute('content', currentPost.summary);")
content = content.replace('}, [activePost]);', '}, [currentPost]);')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed variable names in Blogs.tsx')
