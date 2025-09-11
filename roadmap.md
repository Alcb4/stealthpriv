# Project Development Roadmap: Stealth Co-Founder Challenge

This roadmap outlines the sequential steps required to complete the project. Follow the stages in order to ensure a structured build process. Use checkboxes to track progress: mark as completed with [x] once done.

## Stage 1: Project Setup & Configuration
- [x] 1.1: Initialize a new Next.js project using the App Router with `pnpm create next-app` (select TypeScript, no additional options beyond defaults).
- [x] 1.2: Install all primary dependencies: `pnpm add next react wagmi viem typescript`.
- [x] 1.3: Install optional development dependencies: `pnpm add -D eslint prettier jest @testing-library/react`.
- [x] 1.4: Configure tsconfig.json for strict type checking (enable "strict": true) and ensure compatibility with Next.js.
- [x] 1.5: Set up wagmi and viem providers in a config file (e.g., wagmi.config.ts), configuring exclusively for Base Mainnet (Chain ID: 8453).
- [x] 1.6: Establish the exact file and directory structure as specified in the requirements (/abi/, /lib/, /app/, /public/, README.md, TECHNOTES.md).

## Stage 2: Contract ABI Extraction & Library Setup
- [x] 2.1: Research and extract the ABI for the verified main contract at 0xb7F5cC780B9e391e618323023A392935F44AeACE using direct source or compiler methods (e.g., via Solidity compiler or verified source code); save as /abi/MainContract.json.
- [x] 2.2: Identify at least one unverified internal or abstract contract (e.g., via decompilation or proxy inspection); extract its ABI and save as /abi/InternalContract.json.
- [x] 2.3: Extract the ABI for the iTokenManager contract at 0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c using direct methods; save as /abi/iTokenManager.json.
- [x] 2.4: In /lib/contracts.ts, import all ABIs from /abi/ and export contract addresses, ABIs, and viem contract instances for easy use.
- [x] 2.5: Start TECHNOTES.md by documenting the exact steps, tools, and function signatures for each ABI extraction (update as you proceed).

## Stage 3: UI Component Scaffolding
- [x] 3.1: Create TokenInput.tsx as a static component with an input field for token address (use React hooks for state if needed, but keep non-functional).
- [x] 3.2: Create LoadLendersButton.tsx as a static button component ("Load Top Lenders").
- [x] 3.3: Create TopLendersTable.tsx as a static table with columns: Rank, Wallet (shortened), Outstanding (lent balance), Pool % (share of pool); include placeholders for data and hyperlinks.
- [x] 3.4: Create Loading.tsx as a simple loading spinner or message component.
- [x] 3.5: Create Error.tsx as a component to display error messages.
- [x] 3.6: Assemble all components into /app/page.tsx, including a wallet connect button placeholder and basic layout.

## Stage 4: Wallet & Core UI Integration
- [x] 4.1: Integrate wagmi wallet connection in /app/page.tsx, adding a Connect button and displaying connection status.
- [x] 4.2: Add logic to disable the LoadLendersButton if the wallet is not connected.
- [x] 4.3: Connect TokenInput.tsx state to /app/page.tsx (e.g., via props or context) to capture the entered token address.

## Stage 5: Contract Read Logic Implementation
- [x] 5.1: Using viem, implement reads for getTotalLent(address token) and getPoolSupply(address token) if available.
- [x] 5.2: Implement logic for top 10 lenders: Use getTopLenders(address token, uint count) if available; otherwise, devise a method to query mappings/structs (e.g., iterate known addresses or use off-chain helpers in /lib/mappingUtils.ts) and sort by lent balance.
- [x] 5.3: Implement a read for at least one non-trivial mapping or struct from the unverified internal contract (e.g., via direct viem multicall).
- [x] 5.4: Encapsulate all contract reads into reusable hooks or functions in /app/page.tsx or a separate utils file, ensuring TypeScript typing and error handling.

## Stage 6: Data Integration & State Management
- [x] 6.1: On LoadLendersButton click, trigger contract reads with the input token address (require connected wallet).
- [x] 6.2: Manage loading state: Show Loading.tsx during fetches.
- [x] 6.3: Manage errors: Show Error.tsx with specific messages (e.g., "Invalid token" or "Network error").
- [x] 6.4: Process fetched data: Format balances with token decimals, calculate Pool %, sort top 10, handle empty results.
- [x] 6.5: Pass processed data to TopLendersTable.tsx and render the table.
- [x] 6.6: Above the table, display: Token address, Total Lent, Last Updated timestamp (use current time on fetch).
- [x] 6.7: In the table, shorten wallet addresses and hyperlink to https://basescan.org/address/{full_address}.

## Stage 7: Styling, Testing & Final Touches
- [x] 7.1: Apply basic CSS in /public/styles.css for clean layout (e.g., table styling, responsiveness).
- [x] 7.2: Ensure responsiveness for standard screen sizes (desktop/mobile).
- [x] 7.3: Manually test end-to-end: Connect wallet, enter valid token (e.g., test with known tokens), load data, verify table, handle errors.
- [x] 7.4: Fix build errors and TypeScript compatibility issues.
- [ ] 7.5: Optionally add unit tests for key functions (e.g., data formatting in mappingUtils.ts) using Jest.

## Stage 8: Documentation
- [x] 8.1: Finalize TECHNOTES.md with complete, step-by-step ABI extraction details, tools used, and targeted function signatures.
- [ ] 8.2: Write README.md with project overview, setup instructions (`pnpm install`, `pnpm dev`), usage guide, and placeholders for Vercel URL.

## Stage 9: Deployment & Submission
- [ ] 9.1: Commit and push the complete code to a forked/public GitHub repository.
- [ ] 9.2: Deploy to Vercel via GitHub integration or CLI; configure for Next.js.
- [ ] 9.3: Verify the deployed app works fully (test wallet connect, data loading on Vercel URL).
- [ ] 9.4: Create a pull request to the original repo (https://github.com/mrpapawheelie/stealth), including Vercel URL, repo link, and brief completion notes in the PR description.