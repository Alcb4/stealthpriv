Stealth Technical Co-Founder Challenge – AI Agent Requirements
1. Tech Stack

    Framework: Next.js (App Router)

    UI Library: React

    Wallet Integration: wagmi

    Contract Interaction: viem

    Language: TypeScript

    Styling: Basic CSS only (no UI component libraries).

    Target Network: Base Mainnet (Chain ID: 8453)

Constraint: You must adhere strictly to this stack. Do not introduce any additional libraries or alter the core technologies.
2. File Architecture

Organize the project with the following directory structure precisely. Do not add or remove files or directories.
code Text
IGNORE_WHEN_COPYING_START
IGNORE_WHEN_COPYING_END

    
/abi/
  MainContract.json        # ABI for verified main contract at 0xb7F5cC780B9e391e618323023A392935F44AeACE
  InternalContract.json    # ABI for at least one unverified internal/abstract contract
  iTokenManager.json       # ABI for lending contract at 0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c
/lib/
  contracts.ts             # Export all contract addresses and ABIs
  mappingUtils.ts          # (Optional) Utilities for processing complex contract data structures
/app/
  page.tsx                 # Main page with wallet connect and all UI components
  /components/
    TokenInput.tsx         # Input field for token address
    LoadLendersButton.tsx  # Button to trigger data fetch
    TopLendersTable.tsx    # Table to display results
    Loading.tsx            # Loading state component
    Error.tsx              # Error state component
/public/
  styles.css               # Basic CSS styles
/README.md
/TECHNOTES.md

  

3. Dependencies

Use pnpm exclusively for package management.

Primary Dependencies:

    next

    react

    wagmi

    viem

    typescript

Optional Development Dependencies (for code quality):

    eslint

    prettier

    jest

    @testing-library/react

Constraint: Do not install or use any other dependencies.
4. Core Functionality

Implement the following features exactly as described. All contract reads must target Base Mainnet and use viem with wagmi.

A. Wallet Connection

    Implement a wallet connection feature using wagmi.

    Place a standard connect button on page.tsx.

    All data-fetching functionality must be disabled until a wallet is connected.

B. Top Lenders Display

    Create a UI containing:

        An input field (TokenInput.tsx) for an ERC20 token address.

        A "Load Top Lenders" button (LoadLendersButton.tsx) to initiate the data fetch for the entered token.

    Display results in a table (TopLendersTable.tsx) showing the top 10 lenders by outstanding lent balance.

    The table must have the title: "Top Lenders – iTokenManager @ 0x6aea…61c (Token: [input token address])"

    Directly above the table, display:

        Token Queried: The full token address.

        Total Lent: The sum of all lent balances for the token.

        Last Updated: A timestamp of the successful data fetch.

    The table columns must be exactly:

        Rank: 1 to 10.

        Wallet: Shortened address (e.g., 0x123...abc), hyperlinked to its Basescan page (https://basescan.org/address/{full_wallet}).

        Outstanding: The lent balance, formatted correctly based on the token's decimals.

        Pool %: The lender's share of the total pool, formatted to two decimal places.

    If no lenders are found, display a message within the table body stating "No data available."

C. Contract Interaction

    Target the following contracts on Base Mainnet:

        Verified Main: 0xb7F5cC780B9e391e618323023A392935F44AeACE

        Unverified Internal: At least one internal/abstract contract associated with the main contract.

        iTokenManager Core: 0x6aeac03a15f0ed64df5f193c9d6b80e8c856c61c

    Extract ABIs for all contracts and store them in the /abi/ directory.

    Use lib/contracts.ts to export contract configurations containing addresses and imported ABIs.

    You must read and process at least one non-trivial mapping or struct from an unverified internal contract.

    To fetch lender data, use the appropriate functions from the extracted ABIs, such as:

        getLentBalance(address token, address wallet)

        getTotalLent(address token)

        getPoolSupply(address token) (if available)

        If a getTopLenders function is not exposed, you must devise a method to query and sort the top 10 lenders.

D. UI States

    Display the Loading.tsx component while any data fetch is in progress.

    Display the Error.tsx component for any failures (e.g., invalid token address, network error), showing a clear error message.

    The UI must only update the data table upon a successful fetch.

5. Configuration & Deployment

    The application must be configured exclusively for Base Mainnet (Chain ID: 8453).

    The project must run locally via pnpm dev.

    The project must deploy to Vercel without any modifications or workarounds.

6. Deliverables

    A public Vercel URL with the fully functional, deployed application.

    The complete source code pushed to a public GitHub repository.

    A TECHNOTES.md file documenting:

        The precise steps used to extract each ABI (tools, methods).

        The specific function signatures and data structures targeted.

        A clear explanation of how the internal contract was identified and read.

    A Pull Request to the original challenge repository containing all code, documentation, and the Vercel URL.

7. Hard Rules

    Prohibited Libraries: ethers.js or any other EVM SDKs are forbidden. Use only wagmi and viem.

    ABI Sourcing: ABIs must be extracted directly from the contract source or compiler. Using ABIs from block explorers or other unverified sources is a failure condition. The extraction process must be documented in TECHNOTES.md.

    Contract Interaction: Interaction with at least one unverified internal contract is mandatory. Reading only from the main verified contract is a failure condition.

    Code Quality: All code must be strongly typed with TypeScript, include comprehensive error handling, and contain clear comments explaining complex logic.

    Stack Integrity: Do not alter the tech stack. The project must run with pnpm dev and deploy to Vercel seamlessly.