# OSINT Framework+ 🔎

A searchable, categorized OSINT tool directory designed to automatically organize tools by what they do and help users discover the right tools from a natural-language task.

## Goal

Add tools once with structured metadata; the app automatically:

- categorizes tools by primary and secondary capability
- builds the visual category tree
- indexes tool descriptions, tags, inputs, outputs and links
- interprets a user's search/task and ranks the most relevant tools
- supports multi-step investigation workflows by chaining compatible tools
- keeps categories discoverable without manually maintaining a giant tree

## Suggested data model

```json
{
  "name": "Example Tool",
  "url": "https://example.com",
  "description": "What the tool does",
  "capabilities": ["email", "username"],
  "categories": ["People Search", "Email Addresses"],
  "inputs": ["username", "email"],
  "outputs": ["profiles", "domains"],
  "tags": ["search", "lookup"],
  "source_type": "web",
  "risk": "low"
}
```

## Automatic organization

The ingestion pipeline should normalize each tool, infer categories from its metadata and description, assign tags, and place it under one primary category plus any relevant secondary categories. Search should use semantic matching rather than exact-name matching.

## Search behavior

Examples:

- `find information about an email` -> Email / People Search tools
- `look up a username across sites` -> Username / Social Networks tools
- `check a domain` -> Domain / DNS / Infrastructure tools
- `verify an image` -> Images / Media Verification tools
- `map a company` -> Business Records / People Search / Domains tools

The interface should show why each result matched, what input it needs, and what output it can produce.

## Safety

The directory should distinguish passive public-data research from intrusive or unauthorized activity. Tool metadata should include a risk/scope field and clear usage notes. Do not automate unauthorized access, credential attacks, stalking, or collection of restricted personal information.

## Implementation direction

A practical stack is a static front end plus a JSON tool registry first. Add a small backend later for semantic search, ingestion, validation, and optional user accounts. Keep the registry schema stable so tools can be added without changing the UI.
