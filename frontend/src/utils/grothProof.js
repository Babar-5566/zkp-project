import { groth16 } from "snarkjs"

export async function generateAgeProof(age, requiredAge) {

  const input = {
    age,
    requiredAge
  }

  const { proof, publicSignals } =
    await groth16.fullProve(
      input,
      "/zk/age_proof.wasm",
      "/zk/circuit_final.zkey"
    )

  return { proof, publicSignals }
}