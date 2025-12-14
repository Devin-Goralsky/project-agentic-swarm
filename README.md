# Project Agentic Swarm

A collaborative workspace for building agentic systems.

## Overview

This project is set up with modern development practices and agent-friendly tooling for building and coordinating AI agent systems.

## Repository

https://github.com/Devin-Goralsky/project-agentic-swarm

## Project Structure

```
project-agentic-swarm/
├── README.md          # This file
├── .gitignore         # Git ignore patterns
├── AGENTS.md          # Agent collaboration guidelines
├── .beads/            # Issue tracking database
└── history/           # AI-generated planning documents
```

## Issue Tracking

This project uses **bd (beads)** for issue tracking. See [`AGENTS.md`](./AGENTS.md) for usage guidelines.

### Quick Start

```bash
# Check for ready work
bd ready --json

# Create new issue
bd create "Issue title" -t bug|feature|task -p 0-4 --json

# Update issue status
bd update bd-42 --status in_progress --json

# Complete work
bd close bd-42 --reason "Completed" --json
```

## Getting Started

1. Clone the repository
2. Install bd (beads): `pip install beads`
3. Check the issue tracker: `bd ready`
4. Start building!

## Contributing

- Use bd for all issue tracking
- Store AI planning documents in `history/`
- Follow the guidelines in AGENTS.md
