import assert from "assert";
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import {
    Keypair,
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
    Orao,
    networkStateAccountAddress,
    randomnessAccountAddress,
    FulfillBuilder,
    InitBuilder,
} from "@orao-network/solana-vrf";
import { AnchorVrf } from "../target/types/anchor_vrf";
import nacl from "tweetnacl";

describe("russian-roulette", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace
        .AnchorVrf as Program<AnchorVrf>;
    const vrf = new Orao(provider);

    // This accounts are for test VRF.
    // const treasury = Keypair.generate();
    // const fulfillmentAuthority = Keypair.generate();

    // Initial force for russian-roulette
    let force = Keypair.generate().publicKey;
    // Player state account address won't change during the tests.
    const [playerState] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("russian-roulette-player-state"),
            provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
    );

    // This helper will play a single round of russian-roulette.
    async function spinAndPullTheTrigger(prevForce: Buffer, force: Buffer) {
        const prevRound = randomnessAccountAddress(prevForce);
        const random = randomnessAccountAddress(force);
        const networkState = await vrf.getNetworkState()

        return await program.methods
            .spinAndPullTheTrigger([...force])
            .accounts({
                player: provider.wallet.publicKey,
                playerState,
                prevRound:prevRound,
                vrf: vrf.programId,
                config: networkStateAccountAddress(),
                treasury: networkState.config.treasury,
                random,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    }

    // This helper will fulfill randomness for our test VRF.
    // async function emulateFulfill(seed: Buffer) {
    //     let signature = nacl.sign.detached(
    //         seed,
    //         fulfillmentAuthority.secretKey
    //     );
    //     await new FulfillBuilder(vrf, seed).rpc(
    //         fulfillmentAuthority.publicKey,
    //         signature
    //     );
    // }

    // before(async () => {
    //     // Initialize test VRF
    //     const fee = 2 * LAMPORTS_PER_SOL;
    //     const networkState = await vrf.getNetworkState()
    //     // const fulfillmentAuthorities = [fulfillmentAuthority.publicKey];
    //     const fulfillmentAuthority = Keypair.fromSeed(Buffer.alloc(32));
    //     // // const configAuthority = Keypair.generate();

    //     await new InitBuilder(
    //         vrf,
    //         provider.wallet.publicKey,
    //         networkState.config.treasury,
    //         [fulfillmentAuthority.publicKey],
    //         new BN(fee)
    //     ).rpc();
    // });

    // it("spin and pull the trigger", async () => {
    //     await spinAndPullTheTrigger(Buffer.alloc(32), force.toBuffer());

    //     const playerStateAcc = await program.account.playerState.fetch(
    //         playerState
    //     );

    //     assert.ok(Buffer.from(playerStateAcc.force).equals(force.toBuffer()));
    //     assert.ok(playerStateAcc.rounds.eq(new BN(1)));
    // });

    it("play until dead", async () => {
        let currentNumberOfRounds = 1;
        // let prevForce = force;
        const playerStateAcc = await program.account.playerState.fetch(
                playerState
            );
            force = Keypair.generate().publicKey;
        let prevForce = playerStateAcc.force;
        // while (true) {
            let randomness = await vrf.waitFulfilled(Buffer.from(prevForce));
        //         // vrf.request()
        //         // emulateFulfill(force.toBuffer()),
                
            

        //     // assert.ok(
        //     //     !Buffer.from(randomness.randomness).equals(Buffer.alloc(64))
        //     // );

        //     if (
        //         Buffer.from(randomness.fulfilled()).readBigUInt64LE() %
        //             BigInt(6) ===
        //         BigInt(0)
        //     ) {
        //         console.log("The player is dead");
        //         break;
        //     } else {
        //         console.log("The player is alive");
        //     }
        //             const networkState = await vrf.getNetworkState()

        //     console.log(networkState.config.authority);
            
            // Run another round
            // prevForce = force;
            // let randomness2 = await vrf.getRandomness(Buffer.from(prevForce));
            //   const fulfillmentAuthority = Keypair.fromSeed(Buffer.alloc(32));
            //   let wallet=(provider.wallet)as anchor.Wallet
            //       const networkState = await vrf.getNetworkState()
            //   console.log(networkState.config.fulfillmentAuthorities,);
            //     const fulfillmentAuthority = Keypair.fromSeed(Buffer.alloc(32));
            // // let randomness2 = await vrf.getRandomness(Buffer.from(prevForce));
            //   console.log(fulfillmentAuthority.publicKey);
              
              
        //     let signature = nacl.sign.detached(
        //     Buffer.from(prevForce),
        //     Buffer.from(fulfillmentAuthority.secretKey)
        // );
        // await new FulfillBuilder(vrf, Buffer.from(prevForce)).rpc(
        //     networkState.config.fulfillmentAuthorities[0],
        //     signature
        // );
            // console.log(randomness2);
            
            
            let s=await spinAndPullTheTrigger(Buffer.from(playerStateAcc.force), force.toBuffer());
            console.log(s);
            

            // const playerStateAcc = await program.account.playerState.fetch(
            //     playerState
            // );

            // assert.ok(
            //     Buffer.from(playerStateAcc.force).equals(force.toBuffer())
            // );
            // assert.ok(
            //     playerStateAcc.rounds.eq(new BN(++currentNumberOfRounds))
            // );
        // }
    });

    // it("can't play anymore", async () => {
    //     const prevForce = force;
    //     force = Keypair.generate().publicKey;
    //     try {
    //         await spinAndPullTheTrigger(prevForce.toBuffer(), force.toBuffer());
    //     } catch (e) {
    //         assert.equal(e.error.errorCode.code, "PlayerDead");
    //         return;
    //     }

    //     assert.ok(false, "Instruction invocation should fail");
    // });
});