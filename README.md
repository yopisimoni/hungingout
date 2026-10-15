# Kharja · S·P·O·T

**Split. Plan. Out. Together.**

Kharja helps groups plan an outing in Morocco by budget: tell it how many you are, how much you have and the vibe you want, and it suggests the best cafés, restaurants, rooftops and activities, with the cost per person and for the whole group.

**Status:** beta / concept demo.

## What's in the beta

- 7 cities: Casablanca, Rabat, Marrakech, Tangier, Agadir, Fès (World Cup 2030 host cities) and Khénifra
- 5 languages: Arabic, French, English, Spanish, Portuguese
- Budget calculator by group size and vibe, with an automatic two-stop plan
- Share a plan on WhatsApp, friends vote on each stop
- Sign up / sign in screens (Google, Apple, email) – UI only for now
- "After the outing" story card showing what everyone paid
- "List your place" section for café and restaurant owners (free, featured, deals)

## Data honesty

Every place is real. Prices are marked either **from a published source** (with the link) or **estimated – needs checking**. Estimates must be verified before launch.

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole beta app (HTML, CSS and JS in one file) |
| `img/` | Photos used on the page |
| `firestore.rules` | Draft Firebase security rules for accounts, plans, votes and listing requests |
| `.gitignore` | Keeps secrets (`.env`, keys, service-account files) and junk out of the repo |

## Security rules for this repo

- The Firebase **web config** (`apiKey`, `projectId`, …) is public by design and may live in the code.
- **Never commit** a Firebase/Google **service account key** (a JSON file with `private_key`) or any `.env` file.

## Roadmap

1. Verify real prices (Khénifra first) and invite venue owners
2. Connect Firebase: real accounts, saved plans, share links, votes, listing requests
3. Domain + one indexable page per place and per city in 5 languages (SEO / GEO / AEO)
4. Privacy policy, terms, CNDP declaration
5. Later: user photos, group meetups (18+)
