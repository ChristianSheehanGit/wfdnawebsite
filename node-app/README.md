# Wolfpack DNA Admin API (Boilerplate)

A placeholder Node.js/Express API for the Wolfpack DNA admin panel. All handlers are stubs — no real database, email, or cloud storage integration.

## Project Structure

```
node-app/
├── server.js                    # Express app entry point
├── package.json
├── README.md
├── models/
│   ├── Case.js                  # Case model (name, description, type, date, image)
│   ├── TeamMember.js            # Team member model (name, roles, description, image)
│   └── Inquiry.js               # Inquiry model (name, email, phone, subject, message)
├── controllers/
│   ├── caseController.js        # CRUD for cases
│   ├── teamController.js        # CRUD for team members
│   ├── inquiryController.js     # Submit inquiry + trigger emails
│   └── imageController.js       # Upload/replace/delete images
├── routes/
│   ├── caseRoutes.js
│   ├── teamRoutes.js
│   ├── inquiryRoutes.js
│   └── imageRoutes.js
└── services/
    ├── cloudStorageService.js   # GCS image upload placeholder
    ├── cloudflareDbService.js   # Cloudflare D1 CRUD placeholder
    └── emailService.js          # Confirmation + forwarding email placeholder
```

## API Endpoints

### Cases — `/api/cases`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/cases` | List all cases |
| GET | `/api/cases/:id` | Get a single case |
| POST | `/api/cases` | Create a case |
| PUT | `/api/cases/:id` | Update a case |
| DELETE | `/api/cases/:id` | Delete a case |

**POST/PUT body:** `{ name, description, type ("law enforcement" | "genealogy"), date, image }`

### Team Members — `/api/team`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/team` | List all team members |
| GET | `/api/team/:id` | Get a single team member |
| POST | `/api/team` | Create a team member |
| PUT | `/api/team/:id` | Update a team member |
| DELETE | `/api/team/:id` | Delete a team member |

**POST/PUT body:** `{ name, roles (array), description, image }`

### Inquiries — `/api/inquiries`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/inquiries` | Submit a contact form inquiry |

**POST body:** `{ name, email, phone, subject, message }`

Triggers both a confirmation email to the submitter and a forward to the internal admin email.

### Images — `/api/images`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/images/upload` | Upload/replace an image (multipart/form-data) |
| DELETE | `/api/images/:filename` | Delete an image from the bucket |

**POST fields:** `file` (binary), `filename` (optional target name, e.g. `about.jpg`)

### Health — `/api/health`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |

## Getting Started

```bash
# 1. Install dependencies
cd node-app
npm install

# 2. Start the server
npm start        # or: npm run dev (with --watch)
```

The server will start on `http://localhost:3001`.

## Environment Variables (optional, all have defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `GCS_BUCKET` | `wolfpackdna-images` | Google Cloud Storage bucket name |
| `CF_DB_NAME` | `wolfpackdna-db` | Cloudflare D1 database name |
| `CF_API_TOKEN` | `placeholder-token` | Cloudflare API token |
| `CF_ACCOUNT_ID` | `placeholder-account` | Cloudflare account ID |
| `FROM_EMAIL` | `noreply@wolfpackdna.com` | Sender email for confirmations |
| `INTERNAL_EMAIL` | `admin@wolfpackdna.com` | Internal email to forward inquiries to |

## What's Placeholder

- **Cloudflare D1** — all CRUD operations log to console and return empty/fake data
- **Google Cloud Storage** — uploads log to console and return a fake URL
- **Email** — sends are logged to console with fake message IDs
- **No authentication** — no auth middleware is implemented