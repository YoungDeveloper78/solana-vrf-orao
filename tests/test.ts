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
    
    const fulfillmentAuthority = Keypair.fromSeed(Buffer.alloc(32));

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
        let networkStateAcc = await vrf.getNetworkState();
        const treasury = networkStateAcc.config.treasury
        const prevRound = randomnessAccountAddress(prevForce);
        const random = randomnessAccountAddress(force);

        await program.methods
            .spinAndPullTheTrigger([...force])
            .accounts({
                player: provider.wallet.publicKey,
                playerState,
                prevRound,
                vrf: vrf.programId,
                config: networkStateAccountAddress(),
                treasury: treasury,
                random,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
    }

    // This helper will fulfill randomness for our test VRF.
    async function emulateFulfill(seed: Buffer) {
        let signature = nacl.sign.detached(
            seed,
            fulfillmentAuthority.secretKey
        );
        await new FulfillBuilder(vrf, seed).rpc(
            fulfillmentAuthority.publicKey,
            signature
        );
    }

    before(async () => {
        // let networkStateAcc;
        try {
            let networkStateAcc = await vrf.getNetworkState();
        } catch (e) {
            
            // not initialized
            const tx = await new InitBuilder(
                vrf,
                provider.publicKey,
                provider.publicKey,
                [provider.publicKey],
                new BN(2 * LAMPORTS_PER_SOL)
            ).rpc();
            console.log("InitNetwork transaction signature", tx);
            
        }
        

    });

    // it("init network", async () => {
        
        // assert.ok(networkStateAcc.config.authority.equals(provider.publicKey));
        // assert.ok(networkStateAcc.config.treasury.equals(provider.publicKey));
        // assert.ok(networkStateAcc.config.requestFee.eq(new BN(2 * web3.LAMPORTS_PER_SOL)));
        // assert.deepEqual(networkStateAcc.config.fulfillmentAuthorities, [
        //     fulfillmentAuthority.publicKey,
        // ]);
    // });
    it("spin and pull the trigger", async () => {
        await spinAndPullTheTrigger(Buffer.alloc(32), force.toBuffer());

        const playerStateAcc = await program.account.playerState.fetch(
            playerState
        );

        assert.ok(Buffer.from(playerStateAcc.force).equals(force.toBuffer()));
        assert.ok(playerStateAcc.rounds.eq(new BN(1)));
    });

    it("play until dead", async () => {
        let currentNumberOfRounds = 1;
        let prevForce = force;

        while (true) {
            let [randomness, _] = await Promise.all([
                vrf.waitFulfilled(force.toBuffer()),
                emulateFulfill(force.toBuffer()),
            ]);

            assert.ok(
                !Buffer.from(randomness.randomness).equals(Buffer.alloc(64))
            );

            if (
                Buffer.from(randomness.fulfilled()).readBigUInt64LE() %
                    BigInt(6) ===
                BigInt(0)
            ) {
                console.log("The player is dead");
                break;
            } else {
                console.log("The player is alive");
            }

            // Run another round
            prevForce = force;
            force = Keypair.generate().publicKey;
            await spinAndPullTheTrigger(prevForce.toBuffer(), force.toBuffer());

            const playerStateAcc = await program.account.playerState.fetch(
                playerState
            );

            assert.ok(
                Buffer.from(playerStateAcc.force).equals(force.toBuffer())
            );
            assert.ok(
                playerStateAcc.rounds.eq(new BN(++currentNumberOfRounds))
            );
        }
    });

    it("can't play anymore", async () => {
        const prevForce = force;
        force = Keypair.generate().publicKey;
        try {
            await spinAndPullTheTrigger(prevForce.toBuffer(), force.toBuffer());
        } catch (e) {
            assert.equal(e.error.errorCode.code, "PlayerDead");
            return;
        }

        assert.ok(false, "Instruction invocation should fail");
    });
});