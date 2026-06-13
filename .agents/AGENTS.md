# Destructive Operations Rule
**Never execute irreversible or destructive operations without explicit user confirmation.**
- This includes using flags like `--accept-data-loss`, running `DROP TABLE` SQL commands, forcing push commands that overwrite existing data, or deleting populated directories.
- If you encounter a situation requiring a destructive operation, you must **STOP** and ask the user for permission first.
- When asking for permission, explicitly state **what data currently exists** and exactly **what will be lost** if the operation proceeds.
- Do not proceed until you receive a clear, explicit "yes" or "proceed" from the user.
