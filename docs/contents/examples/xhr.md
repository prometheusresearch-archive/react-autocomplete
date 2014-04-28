---
template: example.js
scripts:
  - scripts/jquery.js
---

# XHR-backed Autocomplete

This example showcases `AutocompleteRemote` which is
made on top of `Autocomplete` and fetches its options from a remote
source.

Implementation of such component is just around 30LOC, usage looks like:

```
<AutocompleteRemote
  url="/autocomplete.json"
  />
```

<div id="example"><div>

In this example search is implemented in browser but in real-world app, you
would want to return items only relevant to a current autocomplete search
query.
