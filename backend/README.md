# PackWise Risk Prediction API

FastAPI service wrapping the `rule_engine` package (Process 5.0 in the
PackWise DFD) — now with Supabase persistence, so every prediction is
saved as history.

## Folder contents

```
rule_engine_api/
├── main.py               <- FastAPI app (the API itself)
├── supabase_client.py    <- Saves results into Supabase after each prediction
├── requirements.txt
├── .env.example          <- Copy to .env and fill in your Supabase credentials
├── rule_engine/          <- the risk engine package (models, rules, engine, mapping)
└── README.md             <- this file
```

## Is this the "final" code?

For the Risk Prediction feature specifically — **yes, this is the complete
data flow**: Dashboard → FastAPI → rule engine → Supabase. It covers your
task #1 (Transport Risk Predictor) end-to-end. It's not "final" in the
sense that:
- rule severity weights/thresholds are still v1 estimates (documented in
  `rule_engine/rules.py`), to be tuned later if you get real test data
- it doesn't yet include auth (task #3) or the PDF report (task #4) —
  those are separate pieces that will eventually call into this same
  `risk_assessment` data

## 1. Setup

```bash
cd rule_engine_api
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Now edit `.env` and fill in:
- `SUPABASE_URL` — from Supabase dashboard: **Settings → API → Project URL**
  (just `https://xxxxx.supabase.co`, no `/rest/v1/` at the end)
- `SUPABASE_SERVICE_KEY` — from Supabase dashboard: **Settings → API →
  service_role secret** (click "Reveal"). **Not** the anon/public key.

## 2. Run the API

```bash
uvicorn main:app --reload --port 8000
```

Open **http://127.0.0.1:8000/docs** — interactive Swagger UI, test the
endpoints directly in the browser without needing the dashboard at all.

If Supabase env vars aren't set, the API still works fine — it just skips
saving and tells you so (`"saved_to_database": false` in the response).
Good for quick local testing without touching the real database.

## 3. How the three pieces connect

```
┌─────────────┐   POST /predict    ┌─────────────┐   insert rows    ┌───────────┐
│  Dashboard   │ ─────────────────> │   FastAPI    │ ───────────────> │ Supabase  │
│  (Lovable/   │                    │  (this repo) │                  │ (Postgres)│
│   React)     │ <───────────────── │              │ <─────────────── │           │
└─────────────┘   risk report JSON  └─────────────┘   assessment_id  └───────────┘
```

- **Dashboard never talks to Supabase directly for risk data** — it only
  calls FastAPI. This matters because RLS is (or should be) enabled on the
  risk tables (see `enable_rls.sql`), so only the backend's `service_role`
  key can actually read/write them. This is intentional, not a limitation.
- **FastAPI is the only thing holding the `service_role` key.** It never
  gets sent to the browser/dashboard.
- Other features (login, viewing packaging plans) MAY talk to Supabase
  directly from the dashboard using Supabase Auth + the `anon` key — that's
  a normal, different pattern for simpler CRUD/auth, separate from this
  risk engine's flow.

## 4. Connecting the dashboard — step by step

1. Get this API running (locally first, then deployed — see below).
2. In your Lovable/React code, find where the Risk Assessment page loads
   its data, and call:

```javascript
async function runRiskAssessment(planId, productData) {
  const response = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan_id: planId,
      product_weight_g: productData.weight,
      height_cm: productData.height,
      fragility_score: productData.fragilityScore,
      center_of_gravity: productData.centerOfGravity,   // "Center" | "Back" | "Left" | ...
      accessory_count: productData.accessories.length,
      accessory_weight_g: productData.totalAccessoryWeight,
      movement_score: productData.movementScore,
      complexity_score: productData.complexityScore,
      stability_index: productData.stabilityIndex,
      recommended_head_strap: productData.straps.head,
      recommended_waist_strap: productData.straps.waist,
      recommended_hand_strap: productData.straps.hand,
      recommended_leg_strap: productData.straps.leg,
    }),
  });
  const riskReport = await response.json();
  return riskReport;
}
```

3. Render `riskReport` directly — its shape already matches your dashboard
   panels:
   - `riskReport.overall_risk_level`
   - `riskReport.categories["Drop Test Risk"].risk_percentage` /
     `.pass_probability`
   - `riskReport.categories["Movement Risk"].risk_percentage`
   - `riskReport.categories["Accessory Loss Risk"].risk_percentage`
   - `riskReport.categories[...].matched_rules` → your "Triggered
     Engineering Rules" table
   - `riskReport.movement_by_region` → "Movement Risk by Body Region" panel
   - `riskReport.accessory_loss_by_item` → "Accessory Loss Probability" panel
   - `riskReport.explanation_trace` → "Engineering Explanation" / "Decision
     Trace" panels
   - `riskReport.assessment_id` → save this if you need to reference this
     exact run later (e.g. deep-linking a report)

## 5. Deploying for real (before demo day)

Running everything on your laptop is risky for a live demo (wifi drops,
laptop sleeps, etc). Recommended:

1. Push this `rule_engine_api` folder to a GitHub repo.
2. Deploy it on **Render.com** (free tier) or **Railway** — both auto-detect
   Python/FastAPI projects. Set the same environment variables
   (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ALLOWED_ORIGINS`) in their
   dashboard's "Environment Variables" settings — don't upload your `.env`
   file itself.
3. Once deployed, you'll get a public URL like
   `https://packwise-api.onrender.com`. Update the `fetch(...)` call in
   your dashboard code to use that URL instead of `localhost:8000`.
4. Set `ALLOWED_ORIGINS` to your actual published dashboard URL at that
   point (see CORS note below).

## 6. Security notes

- **RLS**: run `enable_rls.sql` (provided separately) so the risk tables
  are closed to the public API and only reachable via this backend's
  service_role key.
- **CORS**: set the `ALLOWED_ORIGINS` env var to your real dashboard
  domain before deploying — defaults to `"*"` (open) if unset, which is
  fine for local dev only.
- **Never** put `SUPABASE_SERVICE_KEY` in any frontend code, `.env` files
  that get committed to git, or anywhere a browser could read it.

## 8. Authentication (task #3)

Uses **Supabase Auth** directly (not a custom system) — matches your
original flowchart: Admin creates PE/PM accounts, no public self-signup.

### The password flow (read this — it was corrected from the original plan)

The original plan was: "if a user forgets their password, Admin gives back
their very first original password." **That part isn't possible** — once a
user sets their own password, it's stored as a one-way hash that nobody
(not Admin, not the system itself) can ever read back out. That's not a
policy choice, it's how secure password storage fundamentally works.

What we built instead gives the **exact same user experience**:
1. Admin creates an account with a temporary password (Admin does know
   this one — they just typed it in).
2. On first login, the user is REQUIRED to set their own new password
   (`must_change_password` flag forces this). After that, Admin can never
   see or retrieve it again.
3. If the user forgets their password later, they contact Admin
   offline/chat (same as your flowchart).
4. Admin calls `/auth/reset-password` → the system generates a **brand
   new** temporary password (not the old one — that's gone for good) →
   Admin relays it to the user.
5. User logs in with that temp password, is forced to set a new one again
   (back to step 2).

**One-time bootstrap** (create your first Admin):
1. Run `auth_migration.sql` in Supabase SQL Editor (after `packwise_full_schema.sql`).
2. Supabase dashboard → **Authentication → Users → Add User** → create
   yourself with a password.
3. In **Table Editor → app_user**, find your new row, manually set
   `role` to `Admin` (one-time only — after this, use the API below to
   create everyone else).

**Endpoints** (all under `/auth`):
| Endpoint | Who can call it | What it does |
|---|---|---|
| `POST /auth/login` | Anyone | Log in with email+password, get an access token |
| `POST /auth/create-user` | Admin only | Create a new PE/PM/Admin account (temp password, `must_change_password=true` automatically) |
| `GET /auth/me` | Anyone logged in | Get your own profile — check `must_change_password` here to know whether to force a redirect |
| `POST /auth/change-password` | Anyone logged in | Set your OWN new password (required after first login / after a reset) |
| `POST /auth/reset-password` | Admin only | Issue a brand-new temporary password for a user who forgot theirs |

**Dashboard integration note**: after login, check the response from
`/auth/me` (or the profile returned by `/auth/login`) for
`must_change_password: true`. If true, redirect the user to a "set your
new password" screen BEFORE letting them see anything else, and call
`/auth/change-password` there.

**Using the token**: after `/auth/login`, you get back `access_token`.
Every protected request (like `/predict`) needs it in the header:
```
Authorization: Bearer <access_token>
```

In the dashboard's fetch calls, add that header:
```javascript
fetch("http://localhost:8000/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${accessToken}`,  // store this after login
  },
  body: JSON.stringify(payload),
});
```

`/predict` now REQUIRES a valid token — a logged-out dashboard call will
get a 401/422, by design.

## 9. Known limitations

- Drop Test Risk currently runs on only 2 rules (support points +
  stability index) since physical packaging-construction detail was
  confirmed out of scope — see `rule_engine/rules.py` docstring.
- Severity weights/thresholds are v1 curator estimates, not yet validated
  against real test data.
- `accessory_loss_by_item` currently uses generic names
  (`Accessory_1`, `Accessory_2`, ...) since the flat dataset doesn't carry
  per-accessory names — wire in a real accessory list/join if you want
  actual accessory names to show up.
