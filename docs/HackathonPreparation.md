# Prompt 1 — System Architecture & Flow (Full ZKP System Overview)
```bash
You are a senior Zero Knowledge Proof engineer and hackathon judge.

I have built a ZKP based system using:
- BBS+ signatures
- PLONK (snarkjs)
- Circom circuits
- Groth16 inside PLONK
- Javascript / Node.js libraries

Your task is to analyze my system like a hackathon judge and TEACH me the complete system architecture.

Important instructions:
- Teach as if the student is a beginner in ZKP.
- Explain everything step-by-step.
- Assume the system is already built and working.
- You must explain what the system is doing internally.

Your teaching must focus on:

1. **High Level System Overview**
Explain what the whole system does.

Example questions to answer:
- What problem does the system solve?
- Why ZKP is needed here?
- Why BBS+ signatures are used?
- Why PLONK circuits are used?

2. **System Actors**
Explain the roles of:
- Issuer
- Holder
- Verifier

Explain what each one does in the system.

3. **Full System Flow**
Explain step-by-step flow of the system:

Step 1 — credential issuance  
Step 2 — signature creation  
Step 3 — credential storage by holder  
Step 4 — proof generation  
Step 5 — proof verification  

Explain what exactly happens in each step.

4. **Where Each Technology Is Used**
Explain where these appear in the system:

- BBS+ signatures
- PLONK proof
- Circom circuits
- snarkjs
- cryptographic hashing
- nonces

Explain WHY each is used.

5. **Data Flow**
Explain what data moves between:

Issuer → Holder  
Holder → Verifier  

Also explain which data stays secret.

6. **What the Verifier Actually Trusts**
Explain:
- what the verifier checks
- what guarantees are provided by ZKP
- what cannot be faked by the holder

7. **Hackathon Judge Perspective**
Explain what a judge might ask when seeing this system.

Give at least **10 possible questions** judges may ask about the architecture.

Also give the **correct answers**.

8. **Concepts I Must Understand**
From this architecture alone, list the most important ZKP concepts I must understand.

Explain each briefly.

9. **System Limitations**
Explain possible weaknesses or limitations such as:

- scalability
- revocation difficulty
- trusted setup concerns
- complexity of circuits

Also explain how to answer these in a hackathon presentation.

10. **Summary**
Give a short summary of the entire system so that I can explain it in **1 minute during the hackathon presentation**.

Important rules for your teaching:
- Do NOT skip steps.
- Use simple explanations.
- Avoid assuming prior knowledge.
- Focus on teaching, not just describing.

If some detail depends on the code implementation, ask me to show the relevant file.
```
