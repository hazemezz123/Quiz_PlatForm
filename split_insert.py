import json

with open('questions_clean.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Add sheet field to each question
for q in questions:
    q['sheet'] = 'unOfficial Sheet'

# Split into 4 batches of 20 questions each
batch_size = 20
batches = []
for i in range(0, len(questions), batch_size):
    batch = questions[i:i+batch_size]
    values = []
    for q in batch:
        options_json = json.dumps(q['options'], ensure_ascii=False)
        values.append(
            f"('{q['category']}', '{q['type']}', $q${q['question']}$q$, "
            f"$j${options_json}$j$::jsonb, {q['answer']}, "
            f"$q${q['explanation']}$q$, '{q['sheet']}')"
        )
    sql = 'INSERT INTO questions (category, type, question, options, answer, explanation, sheet) VALUES\n' + ',\n'.join(values) + ';'
    batches.append(sql)

for idx, batch_sql in enumerate(batches):
    with open(f'temp_batch_{idx+1}.sql', 'w', encoding='utf-8') as f:
        f.write(batch_sql)
    print(f'Batch {idx+1}: {len(batches[idx*batch_size:(idx+1)*batch_size])} questions, {len(batch_sql)} chars')

print(f'Total batches: {len(batches)}')