import re
import json

with open('questions.md', 'r', encoding='utf-8') as f:
    content = f.read()

questions = []

# Split content by major sections
# Find the MCQ section (A) and True/False section (B)
# MCQ section starts after "## A. Multiple Choice Questions" and ends before "---"
mcq_section = re.search(r'## A\. Multiple Choice Questions(.*?)---', content, re.DOTALL)
tf_section = re.search(r'# B\. True / False Questions(.*?)(?:---|\Z)', content, re.DOTALL)

# Parse MCQ questions
if mcq_section:
    mcq_text = mcq_section.group(1)
    # Split by "### N." pattern
    mcq_blocks = re.split(r'\n### (\d+)\.\s*', mcq_text)
    # mcq_blocks[0] is empty or intro, then pairs of (num, content)
    for i in range(1, len(mcq_blocks), 2):
        if i + 1 < len(mcq_blocks):
            num = mcq_blocks[i]
            block = mcq_blocks[i + 1]
            
            # Split question from options
            lines = block.strip().split('\n')
            question_text = lines[0].strip()
            
            options = []
            answer_idx = -1
            for line in lines[1:]:
                match = re.match(r'- \[([ x])\] ([a-d])\) (.+)', line.strip())
                if match:
                    checked, letter, text = match.groups()
                    options.append(text.strip())
                    if checked == 'x':
                        answer_idx = len(options) - 1
            
            if options and answer_idx >= 0:
                questions.append({
                    "category": "Operating System",
                    "type": "mcq",
                    "question": question_text,
                    "options": options,
                    "answer": answer_idx,
                    "explanation": f"Correct answer is option {chr(97 + answer_idx)}: {options[answer_idx]}"
                })

# Parse True/False questions
if tf_section:
    tf_text = tf_section.group(1)
    # Split by "## N." pattern
    tf_blocks = re.split(r'\n## (\d+)\.\s*', tf_text)
    for i in range(1, len(tf_blocks), 2):
        if i + 1 < len(tf_blocks):
            num = tf_blocks[i]
            block = tf_blocks[i + 1]
            
            lines = block.strip().split('\n')
            question_text = lines[0].strip()
            
            answer = None
            correction = None
            for line in lines[1:]:
                if line.strip().startswith('**Answer:**'):
                    answer = line.replace('**Answer:**', '').strip()
                elif line.strip().startswith('**Correction:**'):
                    correction = line.replace('**Correction:**', '').strip()
            
            if answer:
                is_true = answer.lower() == 'true'
                questions.append({
                    "category": "Operating System",
                    "type": "truefalse",
                    "question": question_text,
                    "options": ["True", "False"],
                    "answer": 0 if is_true else 1,
                    "explanation": correction if correction else f"The correct answer is {answer}."
                })

# Add sheet field
for q in questions:
    q['sheet'] = 'Lecture 1'

# Save to JSON
with open('os_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(questions)} questions")
for i, q in enumerate(questions):
    print(f"  {i+1}. [{q['type']}] {q['question'][:70]}...")
    print(f"     Options: {q['options']}")
    print(f"     Answer: {q['answer']} ({q['options'][q['answer']]})")
    print(f"     Explanation: {q['explanation'][:80]}...")
    print()