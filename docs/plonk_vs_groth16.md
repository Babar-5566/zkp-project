# PLONK vs Groth16 — Understanding ZK Proving Systems

## Prompt for Learning About PLONK (covers Groth16 too)

> **Use this prompt with any AI or study guide to learn about PLONK:**
>
> "Explain PLONK (Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge) as a zero-knowledge proof system. Cover the following:
>
> 1. **How Groth16 works** (trusted setup, R1CS, QAP, bilinear pairings on elliptic curves, proving/verification keys)
> 2. **Why PLONK is considered a superset** of Groth16's capabilities — specifically how it handles the same R1CS/arithmetic circuits but with a universal trusted setup instead of per-circuit setup
> 3. **Key differences**: universal vs per-circuit setup, proof sizes (Groth16 ~128 bytes vs PLONK ~400 bytes), verification time, custom gates
> 4. **PLONK's architecture**: polynomial commitment schemes (KZG), permutation arguments, copy constraints, the role of the SRS (Structured Reference String)
> 5. **Practical implications**: when to use Groth16 vs PLONK, trade-offs, and why PLONK is often preferred in production (easier key management, circuit-agnostic setup)
>
> Explain as if I already understand the concept of zero-knowledge proofs but want to deeply understand the proving systems themselves."

---

## Quick Comparison Table

| Feature | Groth16 | PLONK |
|---|---|---|
| **Trusted Setup** | Per-circuit (different ceremony for each circuit) | Universal (one ceremony reused for all circuits) |
| **Proof Size** | ~128 bytes (smallest known) | ~400 bytes |
| **Verification Time** | ~3ms (fastest known) | ~5-10ms |
| **Prover Time** | Fast | Slightly slower |
| **Circuit Changes** | Need new trusted setup | Reuse same setup |
| **Custom Gates** | No | Yes (TurboPlonk, UltraPlonk) |
| **Same Circuits?** | ✅ Both use R1CS from circom | ✅ Both use R1CS from circom |
| **snarkjs Support** | ✅ `snarkjs.groth16.*` | ✅ `snarkjs.plonk.*` |

## Does PLONK Cover Everything Groth16 Does?

**Yes.** Both Groth16 and PLONK work on the same mathematical foundation — arithmetic circuits (R1CS). Any statement you can prove with Groth16, you can also prove with PLONK. The key differences are:

1. **Setup simplicity**: Groth16 requires a new trusted setup ceremony for every circuit. If you change even one constraint in your circuit, you need to redo the entire setup. PLONK uses a **universal setup** — one Powers of Tau ceremony works for ALL circuits, forever.

2. **Proof structure**: Groth16 produces the smallest possible proofs (~3 group elements). PLONK proofs are larger but still very compact for practical purposes.

3. **Flexibility**: PLONK supports custom gates, which means you can create more efficient circuits for specific operations. This is the foundation for TurboPlonk and UltraPlonk variants.

## How Your Project Uses PLONK

```
[Circom Circuits] → [R1CS] → [PLONK Setup (universal)] → [.zkey file]
                                                              ↓
[Browser/Frontend] → snarkjs.plonk.fullProve() → [PLONK proof + public signals]
                                                              ↓
[Backend/Verifier] → snarkjs.plonk.verify() → [true/false]
```

The flow is identical to Groth16 except:
- **No Phase 2 contribution** step during compilation
- **One .zkey per circuit** (not `_0000.zkey` → `_final.zkey` chain)
- **Same circom circuits** — no changes needed to `.circom` files
