Clarifications on Project Requirements

This section provides definitive answers to key strategic questions. You must follow these instructions precisely.
1. Question: What is the required ABI Extraction Method?

Decision: You will use two distinct methods based on contract verification status. The entire process for each must be documented in TECHNOTES.md.

    For Verified Contracts (e.g., MainContract.json):

        Obtain the verified Solidity source code and compiler settings from the contract's page on Basescan.

        Use Remix IDE. Paste the source code, select the exact compiler version (e.g., 0.8.28) and optimization runs (e.g., 10) specified on Basescan, and compile the contract.

        Export the resulting ABI and save it to the correct JSON file in the /abi/ directory.

    For Unverified Contracts (e.g., iTokenManager.json, InternalContract.json):

        You will extract the ABI directly from the contract's bytecode using the @shazow/whatsabi library.

        Use a Node.js script to execute the extraction and write the output file, similar to this:
        code TypeScript

        IGNORE_WHEN_COPYING_START
        IGNORE_WHEN_COPYING_END

            
        import { createPublicClient, http } from 'viem';
        import { base } from 'viem/chains';
        import { whatsabi } from '@shazow/whatsabi';
        import fs from 'fs';

        const client = createPublicClient({ chain: base, transport: http() });
        const address = '0x...'; // Target Unverified Contract Address
        const result = await whatsabi.autoload(address, { client });
        fs.writeFileSync('./abi/ContractName.json', JSON.stringify(result.abi, null, 2));

          

        If function selectors are missing, cross-reference with 4byte.directory and manually add them to the generated ABI file.

2. Question: What is the logic for finding "Top Lenders" if a direct function is unavailable?

Decision: You must use an event-driven discovery method combined with a multicall to fetch current balances.

    Identify Relevant Events: Analyze the contract's ABI to find events that signify lending or deposit actions (e.g., Lend, Deposit, Transfer).

    Fetch Event Logs: Use viem's getLogs function to query the blockchain for these events over a recent but significant block range (e.g., the last 1,000,000 blocks).

    Aggregate Candidate Addresses: Process the logs to compile a unique set of all addresses that have acted as lenders.

    Fetch Balances with Multicall: To avoid rate-limiting and ensure efficiency, use viem's multicall function to execute a single RPC request that fetches the getLentBalance for all candidate addresses.

    Sort and Display: Process the multicall results, sort them in descending order by balance, and display the top 10. This entire logic should reside in /lib/mappingUtils.ts.

3. Question: How should the unverified internal contract be identified?

Decision: You will identify the internal contract by analyzing the main verified contract as a proxy and reading its implementation address directly from storage.

    Confirm Proxy Pattern: The main contract (0xb7F5...ACE) is likely a proxy. The implementation address is stored at a standard storage slot.

    Read Implementation Address: Use viem's getStorageAt function to read the address from storage slot 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc.
    code TypeScript

    IGNORE_WHEN_COPYING_START
    IGNORE_WHEN_COPYING_END

        
    import { createPublicClient, http } from 'viem';
    import { base } from 'viem/chains';

    const client = createPublicClient({ chain: base, transport: http() });
    const implementationAddress = await client.getStorageAt({
      address: '0xb7F5cC780B9e391e618323023A392935F44AeACE',
      slot: '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
    });

      

    Target for Extraction: This implementationAddress is your target "unverified internal contract." Use the WhatsABI method described in Clarification #1 to extract its ABI and save it as /abi/InternalContract.json.

4. Question: What is the priority for the testing strategy?

Decision: Core functionality is the absolute priority. Unit testing is a secondary, optional task to be performed only after the application is fully functional.

    Priority 1: Core Functionality. You must first deliver a working application deployed to Vercel that meets all primary requirements. Manually test the end-to-end flow to ensure correctness.

    Priority 2 (Optional): Unit Testing. If all primary deliverables are complete, you may add unit tests. Focus exclusively on testing pure data transformation functions in /lib/mappingUtils.ts. Use a test runner like Jest and mock all viem client calls to isolate your logic. Do not write tests for UI components.