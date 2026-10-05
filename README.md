# Portfolio

## Production URL

Set `NEXT_PUBLIC_SITE_URL` to the site's HTTPS origin (for example, `https://portfolio.example`).
This value is used for canonical URLs, `robots.txt`'s sitemap declaration, the XML sitemap,
and absolute links in `llms.txt`. If it is unset, the app falls back to the `canonicalOrigin`
value in Admin → Settings. Placeholder/example domains are rejected intentionally.
The production host is not established in this repository, so set the actual site origin at deployment.

Production ingress must enforce HTTPS before requests reach Next.js. The repository does not establish
the hosting platform or a trusted proxy, so the application does not infer the request scheme from
client supplied forwarding headers. HSTS must be enabled at the HTTPS terminator after confirming
all production subdomains support HTTPS. Set `TRUSTED_PROXY_HEADERS=true` only when the ingress
overwrites `x-forwarded-for` or `x-real-ip`; public contact and comment submissions fail closed in
production while this trusted client address configuration is absent. Login and anonymous request
rate buckets are stored in PostgreSQL and shared across app instances.

## Environment

Copy `.env.example` to `.env.local` and fill in the database and authentication values for
your environment. Do not commit secrets.
