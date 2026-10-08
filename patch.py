with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_str = """
import TestHistoryView from '@/components/dashboard/TestHistoryView';
import AITutorView from '@/components/dashboard/AITutorView';
import IeltsTemplatesView from '@/components/dashboard/IeltsTemplatesView';
import IeltsCourseView from '@/components/dashboard/IeltsCourseView';
"""
first_import = content.find('import ')
content = content[:first_import] + import_str.strip() + '\n' + content[first_import:]


# Find the start of Test History block
test_history_start = content.find("activeTab === 'Test History' ? (")
if test_history_start != -1:
    # Find the end of the chain, which is before the final `)}` or `) : null}`
    end_of_chain = content.find("      </div>\n    </div>\n  );\n}", test_history_start)
    if end_of_chain != -1:
        # Search backwards to find the exact `)` before `</div>`
        end_brace = content.rfind(")", test_history_start, end_of_chain)
        
        replacement = """activeTab === 'Test History' ? (
            <TestHistoryView />
          ) : activeTab === 'AI Tutor' ? (
            <AITutorView 
              aiChatMessages={aiChatMessages} 
              setAiChatMessages={setAiChatMessages} 
              aiChatInput={aiChatInput} 
              setAiChatInput={setAiChatInput} 
            />
          ) : activeTab === 'IELTS Templates' ? (
            <IeltsTemplatesView />
          ) : activeTab === 'IELTS Course' ? (
            <IeltsCourseView />
          ) : null"""
        
        content = content[:test_history_start] + replacement + content[end_brace+1:]
        
with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done patching page.tsx")
