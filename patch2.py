import codecs

with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we import MockTestEngine if it's not imported
import_statement = "import MockTestEngine from '@/components/MockTestEngine';\n"
if "MockTestEngine" not in content[:2000]:
    # Insert after the first import
    first_import = content.find("import ")
    content = content[:first_import] + import_statement + content[first_import:]


start = content.find("activeTab === 'Mock Test' ? (")
end = content.find(") : activeTab === 'Add Students' && userRole === 'trainer' ? (")

if start != -1 and end != -1:
    new_mock_test = '''activeTab === 'Mock Test' ? (
            <div style={{ height: '100%', minHeight: '80vh' }}>
              <MockTestEngine testId="TEST001" onFinish={() => handleTabChange('Dashboard')} />
            </div>
          '''
    new_content = content[:start] + new_mock_test + content[end:]
    with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Done Mock Test block!')
else:
    print('Mock Test block Not found')
