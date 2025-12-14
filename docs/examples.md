# Examples

## Reviewing Code

```
pre "function deduplicate(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }
  return result;
}"
```

## Reviewing a Prompt

```
pre "You are a helpful assistant. Answer the user's questions.
Be concise but thorough. If you don't know something, say so."
```

## Reviewing a Process

```
pre -f process.md
```

Where `process.md` contains:
```markdown
Code Review Process:
1. Developer submits PR
2. Reviewer assigned automatically
3. Reviewer provides feedback within 24h
4. Developer addresses feedback
5. Reviewer approves or requests changes
6. PR merged when approved
```

## Reviewing a Hybrid (Prompt + Code)

```
pre "Write a Python function that:
- Takes a list of dictionaries with 'name' and 'score' keys
- Returns the top 3 by score
- Handles ties by alphabetical name order
- Include type hints and docstring"
```
