## Problem

To set up email at `notify.pintask.online`, only the **`notify` subdomain** should be delegated to Lovable's nameservers — not the entire `pintask.online` domain.

It looks like the root domain's nameservers at Hostinger were changed to Lovable's nameservers (`ns3.lovable.cloud` / `ns4.lovable.cloud`). Those nameservers only host DNS for the `notify` subdomain, so all other records for `pintask.online` (website, MX, etc.) disappear — that's why the domain stopped working.

## Fix (do this at Hostinger)

### Step 1 — Restore Hostinger's default nameservers for the root domain
In Hostinger → Domains → `pintask.online` → DNS / Nameservers:
- Switch nameservers back to **Hostinger's defaults** (typically `ns1.dns-parking.com` and `ns2.dns-parking.com`, or whatever Hostinger originally assigned).
- This restores the website and any other DNS for `pintask.online`.

Wait ~15–60 minutes for propagation. The site should come back online.

### Step 2 — Delegate ONLY the `notify` subdomain to Lovable
Still in Hostinger DNS Zone for `pintask.online`, add two **NS records** (not nameserver changes — DNS records inside the zone):

| Type | Name     | Value                  | TTL  |
|------|----------|------------------------|------|
| NS   | notify   | ns3.lovable.cloud      | 3600 |
| NS   | notify   | ns4.lovable.cloud      | 3600 |

Important:
- Type must be **NS**, not A/CNAME.
- Name is just `notify` (Hostinger appends `.pintask.online`).
- Do NOT touch the root domain's nameservers — those stay on Hostinger.
- Remove any A/CNAME/MX records you may have added for `notify` — the NS delegation handles everything.

### Step 3 — Wait for verification
DNS propagation can take up to a few hours (sometimes up to 72h, but usually under 2h). Lovable will automatically verify and activate `notify.pintask.online` for sending email once it sees the NS records.

You can monitor progress in **Cloud → Emails**.

## Summary

- Root domain `pintask.online` → Hostinger nameservers (restores your site).
- Subdomain `notify.pintask.online` → NS records inside Hostinger's DNS zone pointing to `ns3.lovable.cloud` and `ns4.lovable.cloud` (enables email).

Once the site is back up and the NS records for `notify` are in place, both the website and email will work in parallel.
