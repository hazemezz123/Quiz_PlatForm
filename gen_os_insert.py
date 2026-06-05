import json

with open('os_questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Generate SQL INSERT values using dollar-quoting ($q$...$q$) for all text fields
values = []
for q in questions:
    options_json = json.dumps(q['options'], ensure_ascii=False)
    
    values.append(
        f"('{q['category']}', '{q['type']}', $q${q['question']}$q$, "
        f"$j${options_json}$j$::jsonb, {q['answer']}, "
        f"$q${q['explanation']}$q$, '{q['sheet']}')"
    )

sql = 'INSERT INTO questions (category, type, question, options, answer, explanation, sheet) VALUES\n' + ',\n'.join(values) + ' ON CONFLICT DO NOTHING;'

# Write to temp file
with open('os_insert.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f'Generated SQL for {len(questions)} questions')
print(f'File size: {len(sql)} characters')
print()
print(sql[:500] + "..." if len(sql) > 500 else sql)