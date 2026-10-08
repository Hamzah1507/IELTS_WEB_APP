with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
start = content.find("activeTab === 'IELTS Templates'")
end = content.find("activeTab === 'IELTS Course'")
with open('extracted4.txt', 'w', encoding='utf-8') as f:
    f.write(content[start:end])
