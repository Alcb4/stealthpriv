# [Redacted] – Technical Co-Founder Challenge (Stealth)

> If I greenlight you based on your profile, this is not a "let's chat."  
> **Completing this challenge = you're in as technical co-founder.**  
> Co-founders will co-fund a fair-launch dev buy (0.5 ETH each; 1.0 ETH total).  
> If you're unsure, **do not start**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/stealth)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## Goal

Fork this repo and ship a small **Next.js + wagmi + viem** app that:

1. Extracts **ABIs for unverified internal/abstract contracts** behind the **verified** main contract at:
   ```
   Base mainnet address: 0xb7F5cC780B9e391e618323023A392935F44AeACE
   ```

2. Obtains the **ABI** for the lending contract at:
   ```
   Base mainnet address: 0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c
   ```
   (This is an `iTokenManager`-style lending core.)

3. Builds a frontend that **reads at least one non-trivial mapping/struct** from those internals (see Addendum below) and renders live on-chain data.

4. Deploys to **Vercel** with a clean UI and working wallet connect.

This is deliberately **wonky in practice**. Most people bounce when internals aren't verified. Don't. Troubleshoot.

---

## Constraints

- **Stack**: Next.js (App Router), **wagmi** + **viem** only. (No ethers.js.) - Already installed.
- **Network**: Base mainnet (chain id **8453**) - Already configured.
- **Wallet**: Include a standard wagmi Connect button - basic button already on page.tsx.
- **UI**: Basic is fine; correctness and clarity > pixels - simple list item is fine.
- **Timebox**: If you're legit, this is a few focused hours max, senior level can do this in 15 minutes.

---

## Deliverables

- A **public Vercel URL** with the app running.
- A **PR to this repo** with:
  - `/abi/` folder containing JSON ABIs (clearly named).
  - `/lib/contracts.ts` (addresses + ABI imports).
  - Minimal React components that render the data.
  - A short **TECHNOTES.md** explaining exactly how you obtained the ABIs and what you're reading (mappings/structs/signatures).
  - Optional but valued: unit tests for your data mappers.

---

## Acceptance Criteria

- ✅ App connects to Base (8453), wallet connect works.
- ✅ At least **one** read from an **internal/unverified** contract **succeeds** and renders human readable values (not just a raw hex dump or BigInt).
- ✅ You document the ABI extraction path in **TECHNOTES.md**.
- ✅ Build runs locally with `pnpm dev` and deploys on Vercel without hacks.
- ✅ Code is reasonably organized, typed, and not a paste-pile.

**Hard fail if:**
- You only read from the already-verified main contract and never touch an internal.
- You hand-wave the ABI ("copied from someone's gist") without reproducible steps.
- You quietly switch stacks to ethers.js or random SDKs.

---

## Scoring Rubric

- **Troubleshooting clarity (40%)** – sound extraction steps; you understood compiler artifacts vs explorer UX.
- **On-chain data depth (30%)** – you decoded a mapping/struct cleanly; bonus for multi-field joins.
- **Code quality (20%)** – typing, error handling, tidy config.
- **DevEx polish (10%)** – env vars, README clarity, deploy hygiene.

---

## Hints

You are allowed to use AI, but this is about **using tools intelligently**.

### Path A – Remix / compiler artifacts
- Load the **verified main contract** in Remix via explorer import, or paste verified source.
- Use Remix's compiler to **flatten / compile**; inspect the **artifacts** pane for **all referenced contracts**.
- Even if explorers won't verify internals, **Remix artifacts expose ABIs** for them.
- Export each ABI JSON into `/abi/<ContractName>.json`.

### Path B – Explorer plugins & alternates
- Etherscan-family sites won't verify internals reliably; some **RouteScan** instances will.
- Verification still not required—**you only need ABIs**.
- If you can't verify, **derive ABI from compiler output** (solc/Remix). Don't attempt bytecode decomp unless you enjoy pain.

---

## Addendum: Lending Contract (iTokenManager)

You are explicitly required to read live data from the unverified lending contract:

```
0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c
```

This is the iTokenManager lending core. Using its ABI, build a small UI that shows, for a given token address:

1. The Top 10 wallets by outstanding lent balance.
2. For each wallet:
   - Wallet address (shortened + link to Basescan)
   - Outstanding balance (formatted with decimals)
   - Pool % share (two decimals)
3. Totals:
   - Sum of lent balances
   - (Optional) total supply/utilization if exposed

### Output

A table titled:

**Top Lenders – iTokenManager @ 0x6aea…61c (Token: <address>)**

**Columns:** Rank | Wallet | Outstanding | Pool %

Above the table: Token address queried, Total Lent, Last Updated timestamp.

### Documentation

Explain in TECHNOTES.md:
- How you obtained the ABI.
- Which functions/signatures you used.
- Decimals handling.
- Whether you used direct getter or event reconstruction (and why).

### UI Behavior
- Input: Token address.
- Button: "Load Top Lenders" → fetch & render.
- Handle loading/empty/error states gracefully.

---

## Submission

1. Fork → build → deploy to Vercel.
2. Open a PR with:
   - `/abi/*.json`
   - code changes
   - TECHNOTES.md (your extraction steps + function signatures you used)
   - Vercel URL in PR description
3. DM me the PR link.

---

## Ethos

This challenge is intentionally under-documented in the public domain. If you can navigate compiler artifacts, explorer quirks, and ABI plumbing, you've got the MacViber mindset: prompt well, troubleshoot fast, use the right tool, finish the fight.

If I accept your profile and you start this, you're in. We move straight to POC + token launch (with the 0.5 ETH dev buy each) and then into fundraising.

Good luck. Don't overthink—out-think.