# Request flow diagrams

How a request travels from the browser through Vercel to Supabase. Latency figures are rough estimates, not measurements.

Vercel's edge network handles the CDN, routing and middleware. The function (the Next.js server code) is the web app, and it is the only component that talks to Supabase.

## Page load: GET /add (logged in)

```mermaid
sequenceDiagram
    participant B as Browser
    participant E as Vercel Edge (sin1)
    participant F as Function (iad1)
    participant P as Supabase pooler (Sydney, :6543)
    participant D as Postgres (Sydney)

    B->>E: GET /add
    Note over E: middleware.ts checks cookie splitwize_auth=ok
    alt cookie missing
        E-->>B: 307 redirect to /login
    else cookie ok
        E->>F: forward request (~200 ms, cold start if idle)
        F->>P: TCP + TLS + auth (several round trips, ~200 ms each)
        F->>P: SELECT Setting (FX rate)
        P->>D: query
        D-->>P: row
        P-->>F: row
        Note over F: render HTML
        F-->>E: HTML
        E-->>B: HTML
    end

    B->>E: GET /_next/static/*.js, *.css, profile-pics/*.png
    Note over B,E: served from edge cache, no function, no DB
    E-->>B: static files
```

## Form submit: Server Action `addExpense`

```mermaid
sequenceDiagram
    participant B as Browser
    participant E as Vercel Edge (sin1)
    participant F as Function (iad1)
    participant P as Supabase pooler
    participant D as Postgres

    B->>E: POST (Server Action)
    Note over E: middleware.ts checks cookie
    E->>F: forward request
    F->>P: INSERT expense + splits (one transaction)
    P->>D: transaction
    D-->>P: ok
    P-->>F: ok
    F-->>E: result + re-rendered page
    E-->>B: result + re-rendered page
```

## Where the time goes on /add

- Edge to function: one long hop (Singapore to US East), both ways.
- Function to Supabase: a new connection needs TCP, TLS and auth round trips before the query. Each one crosses to Sydney. A warm instance reuses its connection, so only the query costs a round trip.
- Pooler to Postgres: inside Supabase, fast.

With the function region set next to the DB (`syd1`, or `sin1` after moving the project), the function to pooler round trips drop from about 200 ms each to a few ms.

Check the function region with:

```bash
curl -sI https://splitwize-vietnam.vercel.app/login | grep -i x-vercel-id
```

In `x-vercel-id: sin1::iad1::...` the first code is the edge and the second is the function region.
