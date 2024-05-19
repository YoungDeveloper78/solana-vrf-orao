// // import assert from "assert";
// // import * as anchor from "@coral-xyz/anchor";
// // import { Program, BN } from "@coral-xyz/anchor";
// // import {
// //     Keypair,
// //     PublicKey,
// //     SystemProgram,
// //     LAMPORTS_PER_SOL,Transaction
// // } from "@solana/web3.js";
// // import {
// //     Orao,
// //     networkStateAccountAddress,
// //     randomnessAccountAddress,
// //     FulfillBuilder,
// //     InitBuilder
    
// // } from "@orao-network/solana-vrf";
// import { AnchorVrf ,IDL} from "../target/types/anchor_vrf";
// import nacl from "tweetnacl";

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import {
//     Keypair,
//     PublicKey,
//     SystemProgram,
// } from "@solana/web3.js";
// import { Orao, networkStateAccountAddress, randomnessAccountAddress } from "@orao-network/solana-vrf";
// // import { Cflip, IDL } from "../target/types/cflip";

// describe("cflip", () => {
//     const provider = anchor.AnchorProvider.env();
//     anchor.setProvider(provider);

//     const program = new Program<AnchorVrf>(IDL, new PublicKey("516vGAjz1mwiu359n3UZBFCbvWPNETvBhBVKevfSrL27"), provider);
//     const vrf = new Orao(provider);

//     // Initial force for russian-roulette
//     let force = Keypair.generate().publicKey;

//     // This helper will play a single round of russian-roulette.
//     async function spinAndPullTheTrigger(force: Buffer) {
//         const random = randomnessAccountAddress(force);
//         const networkState = await vrf.getNetworkState()
//         const treasury = networkState.config.treasury

//     await program.methods
//         .spinAndPullTheTrigger([...force])
//         .accounts({
//             player: provider.wallet.publicKey,
//             vrf: vrf.programId,
//             config: networkStateAccountAddress(),
//             treasury,
//             random,
//             systemProgram: SystemProgram.programId,
//             playerState:
//         })
//         .rpc();
// }

// it("spin and pull the trigger", async () => {
//     await spinAndPullTheTrigger(force.toBuffer());

//     // Await fulfilled randomness (default commitment is "finalized"):
//     const randomness = await vrf.waitFulfilled(force.toBuffer());
//     console.log("Your randomness is " + randomness.fulfilled());
//     });
// });

// // const [playerState] = PublicKey.findProgramAddressSync(
// //         [
// //             Buffer.from("russian-roulette-player-state"),
// //             provider.wallet.publicKey.toBuffer(),
// //         ],
// //         program.programId
// //     );