# Haqdarshak-Inspired Resume Website

This is a lightweight single-page website that mirrors the section flow and visual tone of the Haqdarshak homepage, but replaces the company content with Prakhar Bhargava's personal application story.

## Files

- `index.html` - page structure
- `styles.css` - layout and visual styling
- `script.js` - all editable content and rendering logic

## How to edit the content

Open `script.js` and update the `siteContent` object at the top of the file.

The main editable groups are:

- `hero` - headline, subheadline, and top CTA buttons
- `identity` - who you are and why you are applying
- `capabilities` - what you bring to the table
- `impact` - proof points and stats
- `focus` - what you will work on
- `metrics` - what you will measure
- `roadmap` - 3/6/9 month plan
- `closing` - final closing thought

## Run locally

Use any static file server. For example:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Notes

- The layout is intentionally static and simple, so copy can be rewritten without changing the structure.
- The design is inspired by the feel and section rhythm of Haqdarshak's website, not a literal clone of their production implementation.
