# Customization

## Adding Dimensions

**Human version:**
```markdown
**Universal Dimensions (always consider):**
...existing dimensions...
- **Your New Dimension:** What question does it answer?
```

**Agent version:**
```
universal: {
  ...existing dimensions...
  your_new_dimension: [check1, check2, check3]
}
```

## Adding Optimization Types

**Agent version:**
```
heuristics: {
  ...existing types...
  your_type: [keyword1, keyword2, keyword3]
}

type_specific: {
  ...existing types...
  your_type: [dimension1, dimension2, dimension3]
}
```

## Adjusting Thoroughness

The default prioritizes thoroughness. To reduce verbosity:

**Human version:** Add to instructions:
> "Focus on top 5 issues only. Skip minor concerns."

**Agent version:** Modify output structure:
```
issues: {
  max: 5
  filter: severity >= moderate
}
```
