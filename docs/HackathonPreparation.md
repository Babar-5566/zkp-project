# Team Preparation Guide for ZKP Hackathon

This document explains **how the team should use the training prompts** provided for understanding the ZKP system.

The goal is that **each teammate becomes an expert in specific domains**, and together the team can confidently explain the entire system during the hackathon.

---

# Purpose of These Prompts

Each prompt is designed to:

- Act as a **teacher prompt for an AI**
- Make the AI **explain a specific domain deeply**
- Help a teammate **master one independent topic**

These prompts are **not questions**.

They are **instructions given to an AI** so that it teaches the topic in a structured way.

Each teammate will:

1. Take their assigned prompts
2. Give them to the AI
3. Learn the topic completely
4. Become the **team expert for that topic**
### Step 5 — Add Your Name to the Topic

After the team decides who will study which topics,  
each teammate should **write their name next to their assigned topic** in the topic distribution section.

Example format :
System Architecture & Security - YOUR_NAME
Credentials & Revocation - Alice
ZKP Proof System - Bob
Protocol Security & Implementation - Charlie
This helps the team clearly identify **who is responsible for which domain**.
---

# How Each Teammate Should Use the Prompts

For each assigned prompt:

### Step 1 — Copy the Prompt

Copy the entire prompt exactly as provided.

Do not modify it.

---

### Step 2 — Give the Prompt to the AI (must use antigravity as it will analyze the system automatically)

Paste the prompt into the AI (antigravity).

The AI will then **teach the topic step-by-step**.

---

### Step 3 — Learn the Topic Deeply

While studying the topic:

- Ask follow-up questions
- Request examples
- Ask for clarifications
- Try to understand both **theory and system implementation**

The goal is to become the **team expert** in that domain.

---

### Step 4 — Study the Actual Project Code

After understanding the concept:

Check how it appears in the project:

- which files implement it
- which libraries are used
- where it appears in the system flow

Understanding the **connection between theory and implementation** is important.

---

### Step 5 — Prepare to Teach the Team

Once you understand your domain:

- explain it to the rest of the team
- answer their questions
- help them understand how your part connects to theirs

By combining all domains, the **entire system knowledge is covered**.

---

# Expected Learning Outcome

Each teammate should be able to:

- explain their topic clearly
- answer hackathon judge questions about that topic
- explain how it appears in the system

---

# Team Topic Distribution

The topics are divided so that **each teammate becomes an expert in two domains**.

Teammate-Justin Samrat Rozario-System Architecture and Secuirity.
---

# System Architecture & Security - 

Assigned prompts:

- Prompt 1 — System Architecture & Flow
- Prompt 6 — Security Model

Responsibilities:

Understand and explain:

- overall system workflow
- issuer, holder, verifier roles
- data flow between components
- system security guarantees
- threat model

This teammate will explain the **big picture of the system**.

---

# Credentials & Revocation - 

Assigned prompts:

- Prompt 2 — BBS+ Signatures
- Prompt 4 — Revocation & Nullifiers

Responsibilities:

Understand and explain:

- how credentials are signed
- how selective disclosure works
- how attributes are protected
- how credential revocation works
- how nullifiers prevent reuse

This teammate will explain the **credential system**.

---

# ZKP Proof System - 

Assigned prompts:

- Prompt 3 — PLONK / Circom / snarkjs
- Prompt 8 — Circuit Logic & Predicates

Responsibilities:

Understand and explain:

- how ZKP circuits work
- how proofs are generated
- how proofs are verified
- how logical statements are encoded in circuits
- how predicates like age ≥ 18 are proven

This teammate will explain the **ZKP engine of the system**.

---

# Protocol Security & Implementation - Nirupam Pal

Assigned prompts:

- Prompt 5 — Nonces & Replay Protection
- Prompt 7 — Libraries & Implementation Stack

Responsibilities:

Understand and explain:

- nonce usage
- replay attack prevention
- challenge-response protocol
- libraries used in the project
- cryptographic primitives used internally

This teammate will explain the **technical implementation and protocol security**.

---

# Final Team Goal

After all teammates complete their domains, the team should collectively understand:

- how the system works
- how credentials are issued
- how proofs are generated
- how proofs are verified
- how privacy is protected
- how security threats are prevented

The team should then practice explaining the system as if presenting to **hackathon judges**.

---

# Final Tip

Hackathon judges often test:

- conceptual understanding
- system architecture
- security reasoning
- implementation choices

By mastering these prompts, the team will be prepared to answer **most questions judges may ask about the system**.
---
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
---
# Prompt 2 — Deep Understanding of BBS+ Signatures
```bash

You are a senior cryptography engineer and a hackathon judge specializing in Zero Knowledge Proof systems.

I have built a system that uses **BBS+ signatures together with ZKP circuits**.

Your task is to **teach me everything about BBS+ signatures that is relevant to my system**.

Important instructions:

- Teach as if the student is a beginner in cryptography.
- Explain clearly and step-by-step.
- Focus on **practical understanding for hackathons**, not only theory.
- If something depends on implementation, ask me for the relevant file.

Your teaching must cover the following sections.

---

# 1. What BBS+ Signatures Are

Explain clearly:

- What BBS+ signatures are
- Why they are different from normal signatures
- What problem they solve

Explain the **core idea of BBS+** in simple language.

Also explain how BBS+ allows:

- signing **multiple attributes**
- proving statements about attributes
- **selective disclosure**

---

# 2. Why BBS+ Is Used in My System

Explain why a system using credentials or identity verification would choose **BBS+ signatures instead of normal signatures** like:

- RSA
- ECDSA
- EdDSA

Explain the advantages in a ZKP system.

---

# 3. How BBS+ Works Internally

Explain the internal workflow:

- key generation
- signing multiple messages
- proof generation
- proof verification

Explain what these elements represent:

- public key
- private key
- messages
- signature
- proof

Also explain **pairing-based cryptography** in simple terms.

---

# 4. Multi-Attribute Credentials

Explain how BBS+ can sign credentials such as:

- name
- age
- nationality
- university
- membership status

Explain how all attributes are signed **together inside one signature**.

Explain why this is powerful for credential systems.

---

# 5. Selective Disclosure

Explain clearly:

- what selective disclosure means
- how BBS+ enables revealing **some attributes while hiding others**

Example scenario:

A credential contains:

- name
- age
- nationality
- student ID

But the verifier only needs to know:

- age > 18

Explain how BBS+ allows this.

---

# 6. Zero Knowledge Proofs With BBS+

Explain how BBS+ can create **proofs of knowledge of a signature**.

Explain the concept of:

- proof of signature possession
- hidden messages
- revealed messages

Explain how the verifier can trust the proof **without seeing the hidden attributes**.

---

# 7. Reveal vs Hidden Attributes

Explain the difference between:

- revealed attributes
- hidden attributes

Explain how proofs are generated when:

- some attributes are revealed
- some attributes remain hidden.

---

# 8. Nonce Usage in BBS+

Explain what a **nonce** is.

Explain why it is used in BBS+ proofs.

Explain how nonces prevent:

- replay attacks
- proof reuse

Explain how verifier challenges usually work.

---

# 9. Libraries Used for BBS+

Explain typical libraries used for BBS+ such as:

- bbs-signatures
- bbs-signatures-wasm
- noble-curves
- pairing-based crypto libraries

Explain what these libraries provide.

Also explain which functions are typically used:

- key generation
- sign
- create proof
- verify proof

---

# 10. What the Verifier Actually Verifies

Explain what exactly is verified when a BBS+ proof is checked.

Explain:

- how the verifier knows the signature is valid
- how the verifier knows the hidden attributes were not modified
- why the holder cannot fake credentials.

---

# 11. Common Hackathon Judge Questions

Provide at least **10 possible questions judges may ask about BBS+**.

Examples may include:

- Why use BBS+ instead of normal signatures?
- How does selective disclosure work?
- Can the holder forge attributes?
- What cryptography is used internally?

For each question provide the **correct explanation**.

---

# 12. Limitations of BBS+

Explain possible limitations such as:

- computational cost
- complexity
- library maturity
- interoperability issues

Also explain how to answer these limitations in a hackathon presentation.

---

# 13. Important Concepts I Must Know

List the most important concepts related to BBS+ that I must understand, such as:

- selective disclosure
- proof of knowledge
- pairing-based cryptography
- multi-message signatures
- zero knowledge proofs

Explain each briefly.

---

# 14. Practical Summary

Finally give a **simple explanation of BBS+ that I can speak in 30 seconds during a hackathon presentation**.

The explanation must be beginner friendly and clear.
```
---
# Prompt 3 — PLONK, Circom, snarkjs and ZKP Circuits
```bash

You are a senior Zero Knowledge Proof engineer and a hackathon judge.

I have built a system that uses **ZK circuits implemented with Circom and proofs generated with snarkjs using the PLONK proving system**.

Your task is to **teach me everything about PLONK, Circom, and ZKP circuits that is relevant for understanding and presenting my project in a hackathon**.

Important instructions:

- Teach as if the student is a beginner in ZKP.
- Explain concepts clearly and step-by-step.
- Focus on practical understanding for real systems.
- If something depends on the project implementation, ask me to show the relevant file.

Your teaching must cover the following sections.

---

# 1. What Zero Knowledge Proofs Are

Explain:

- What a Zero Knowledge Proof (ZKP) is
- What problem it solves
- The three properties of ZKP:
  - Completeness
  - Soundness
  - Zero Knowledge

Explain this using simple real-world examples.

---

# 2. What a ZK Circuit Is

Explain clearly:

- What a circuit means in ZKP
- Why statements must be written as circuits
- What **constraints** are

Explain the idea that:
Prover proves that a computation was done correctly
without revealing the private inputs

Explain:

- public inputs
- private inputs
- constraints

---

# 3. Introduction to Circom

Explain what **Circom** is.

Explain:

- why Circom is used to write circuits
- how circuits represent mathematical constraints
- how Circom converts code into a constraint system.

Explain the typical Circom components:

- signals
- inputs
- outputs
- templates
- components

Give simple examples of each concept.

---

# 4. Circuit Compilation Process

Explain what happens when a circuit is compiled.

Explain the files generated:

- `.r1cs`
- `.wasm`
- `.sym`

Explain what each file is used for.

Example explanations:

- R1CS → constraint system
- WASM → witness generator
- SYM → debugging symbol file

---

# 5. Witness Generation

Explain what a **witness** is.

Explain:

- why witness generation is required
- how the `.wasm` file generates the witness
- what data the witness contains.

Explain the role of:
input.json

Explain how private and public inputs are used during witness generation.

---

# 6. PLONK Proving System

Explain what **PLONK** is.

Explain:

- that it is a universal zkSNARK proving system
- why it is used instead of older systems.

Explain the advantages:

- universal setup
- smaller trusted setup requirements
- flexible circuits.

Explain the high-level flow of PLONK proof generation.

---

# 7. Role of snarkjs

Explain what **snarkjs** does.

Explain its responsibilities:

- circuit compilation support
- witness generation
- proof generation
- proof verification.

Explain typical commands used in projects.

Example steps:

1. compile circuit
2. generate witness
3. generate proof
4. verify proof.

Explain the purpose of:
.zkey

files.

---

# 8. Proof Generation Process

Explain the full flow of generating a ZK proof.

Explain the role of these artifacts:

- `.wasm`
- `.zkey`
- witness
- public inputs.

Explain step-by-step what happens when the prover creates a proof.

---

# 9. Proof Verification

Explain how a verifier checks the proof.

Explain:

- verification key
- proof object
- public inputs.

Explain what guarantees the verifier obtains.

---

# 10. Why ZKP Circuits Are Used in My System

Explain why circuits are needed for tasks like:

- age verification
- attribute comparison
- equality checks
- range proofs.

Explain how circuits allow **statements to be proven without revealing data**.

---

# 11. Hackathon Judge Questions

Provide at least **10 questions judges might ask about PLONK or Circom**.

Examples:

- Why PLONK instead of Groth16?
- What is a circuit?
- What is a witness?
- What does the `.zkey` file contain?
- Why is a trusted setup needed?

Provide clear answers to each question.

---

# 12. Limitations of ZKP Circuits

Explain possible limitations such as:

- circuit size limitations
- proving time
- memory usage
- complexity of circuit design.

Also explain how to respond to these limitations during a hackathon presentation.

---

# 13. Important Concepts I Must Understand

List the most important concepts related to circuits and PLONK such as:

- constraints
- witness
- trusted setup
- proving key
- verification key
- public vs private inputs.

Explain each briefly.

---

# 14. Practical Summary

Provide a **simple explanation of PLONK and Circom that I can explain in about 30 seconds during a hackathon presentation**.

The explanation should be beginner friendly and easy to remember.
```
---
# Prompt 4 — Revocation, Nullifiers, and Credential Validity in ZKP Systems
```bash

You are a senior cryptography engineer and a hackathon judge specializing in Zero Knowledge Proof credential systems.

I have built a system that uses **BBS+ signatures and ZK proofs for credentials**. One of the critical aspects of such systems is **revocation and preventing misuse of credentials**.

Your task is to **teach me everything about revocation, nullifiers, and credential validity mechanisms that are relevant to my system and a hackathon presentation**.

Important instructions:

- Teach as if the student is a beginner in ZKP credential systems.
- Explain clearly and step-by-step.
- Focus on practical system understanding rather than only theory.
- If something depends on my project implementation, ask me to show the relevant file.

Your teaching must cover the following sections.

---

# 1. The Revocation Problem

Explain what **revocation** means in credential systems.

Explain scenarios where revocation is necessary:

- a credential is expired
- a user is banned
- an account is deleted
- a credential is compromised
- a user loses eligibility

Explain why revocation is **difficult in Zero Knowledge systems**.

---

# 2. Why Revocation Is Hard in ZKP

Explain the key problem:
The verifier cannot see the credential itself.

Explain why this makes traditional revocation methods difficult.

Compare with traditional systems where revocation is easier.

---

# 3. Common Revocation Approaches

Explain the common approaches used in ZKP systems:

- Revocation lists
- Cryptographic accumulators
- Merkle tree revocation
- Short-lived credentials
- On-chain revocation registries

Explain the idea behind each method.

---

# 4. Nullifiers

Explain what **nullifiers** are.

Explain:

- why nullifiers are used
- what problem they solve
- how they prevent credential reuse or double-spending.

Explain the idea that:
A nullifier is a unique cryptographic value derived from a secret.

Explain why it **does not reveal the secret itself**.

---

# 5. How Nullifiers Prevent Double Use

Explain how nullifiers prevent:

- double voting
- double claiming rewards
- double authentication.

Explain the typical workflow:

1. user generates proof
2. nullifier is included
3. verifier checks if nullifier already exists
4. if already used → reject.

---

# 6. Nullifier Generation

Explain how nullifiers are usually created using:

- hash functions
- secret keys
- credential identifiers
- context identifiers.

Explain why nullifiers must be:

- deterministic
- unique
- unlinkable across contexts.

---

# 7. Context-Based Nullifiers

Explain how nullifiers can depend on a **context** such as:

- application ID
- voting event ID
- service identifier.

Explain why this prevents cross-application tracking.

---

# 8. Revocation Using Accumulators

Explain the idea of **cryptographic accumulators**.

Explain how they allow:

- efficient revocation checking
- compact proofs.

Explain how they can be combined with ZKP.

---

# 9. Revocation Using Merkle Trees

Explain how revocation lists can be implemented with **Merkle trees**.

Explain:

- Merkle root
- membership proofs
- non-membership proofs.

Explain how these can be used in circuits.

---

# 10. How Revocation Might Be Implemented in My System

Explain possible ways my system might handle revocation, such as:

- checking nullifiers
- checking revocation lists
- verifying accumulator membership.

Explain what a verifier should check to ensure the credential is still valid.

---

# 11. Hackathon Judge Questions

Provide at least **10 questions judges might ask about revocation or nullifiers**.

Examples include:

- How do you revoke credentials?
- How do you prevent double use?
- What are nullifiers?
- Can a user reuse a credential?
- Can the verifier track the user?

Provide clear explanations for each answer.

---

# 12. Security Considerations

Explain possible security issues such as:

- nullifier collisions
- replay attacks
- revocation delays
- privacy leakage.

Explain how these risks are typically mitigated.

---

# 13. Important Concepts I Must Understand

List the most important concepts related to revocation and nullifiers, such as:

- nullifiers
- revocation lists
- accumulators
- Merkle proofs
- context identifiers.

Explain each briefly.

---

# 14. Practical Summary

Provide a **simple explanation of revocation and nullifiers that I can explain in about 30 seconds during a hackathon presentation**.

The explanation must be beginner friendly and easy to remember.

```
---
# Prompt 5 — Nonces, Replay Attacks, and Challenge–Response Protocols in ZKP Systems
```bash

You are a senior cryptography engineer and a hackathon judge specializing in Zero Knowledge Proof authentication systems.

I have built a system that uses **BBS+ signatures and ZK proofs for credential verification**. A critical security aspect of such systems is preventing **replay attacks and proof reuse**.

Your task is to **teach me everything about nonces, replay protection, and challenge–response protocols that are relevant to my system and a hackathon presentation**.

Important instructions:

- Teach as if the student is a beginner in applied cryptography.
- Explain concepts clearly and step-by-step.
- Focus on practical system behavior rather than only theory.
- If something depends on the implementation, ask me to show the relevant file.

Your teaching must cover the following sections.

---

# 1. The Replay Attack Problem

Explain what a **replay attack** is.

Explain a simple scenario:

- a user generates a valid proof
- an attacker captures the proof
- the attacker reuses the same proof later.

Explain why replay attacks are dangerous in authentication systems.

---

# 2. Replay Attacks in ZKP Systems

Explain why replay attacks are particularly important in ZKP systems.

Explain the key problem:
A proof can be copied if it is not bound to a specific challenge.

Explain why this could allow attackers to reuse proofs.

---

# 3. What a Nonce Is

Explain what a **nonce** is.

Explain the properties of a nonce:

- random
- unique
- used once
- unpredictable.

Explain why nonces are used in cryptographic protocols.

---

# 4. How Nonces Prevent Replay Attacks

Explain the idea that a verifier generates a **fresh nonce for each request**.

Explain the workflow:

1. verifier generates nonce
2. nonce sent to prover
3. prover includes nonce in proof
4. verifier checks the nonce.

Explain why this prevents proof reuse.

---

# 5. Nonces in ZKP Proof Generation

Explain how nonces are integrated into ZKP systems.

Explain that the nonce is typically:

- included as a **public input**
- hashed into the proof challenge
- bound to the proof.

Explain how this ensures the proof is tied to a specific verification request.

---

# 6. Challenge–Response Protocol

Explain the concept of a **challenge–response protocol**.

Explain the typical interaction:

1. verifier sends challenge
2. prover generates proof using challenge
3. verifier checks proof.

Explain how this guarantees **freshness of proofs**.

---

# 7. Binding Proofs to Context

Explain that proofs are often bound to:

- nonce
- verifier identity
- application context
- session ID.

Explain why this prevents proof reuse across different services.

---

# 8. Nonce Generation Best Practices

Explain how nonces should be generated.

Explain that they should be:

- cryptographically random
- unique per verification session
- unpredictable.

Explain typical methods such as:

- secure random number generators
- cryptographic libraries.

---

# 9. Where Nonces Appear in My System

Explain where nonces may appear in a system using:

- BBS+ proofs
- ZK circuits
- verification processes.

Explain how they interact with proof generation and verification.

---

# 10. Hackathon Judge Questions

Provide at least **10 questions judges might ask about nonces or replay protection**.

Examples include:

- How do you prevent replay attacks?
- What is a nonce?
- Can someone reuse a proof?
- What happens if the same proof is submitted twice?

Provide clear answers to each question.

---

# 11. Security Considerations

Explain possible security issues such as:

- predictable nonces
- reused nonces
- improper nonce verification.

Explain how these issues can compromise security.

Explain how systems typically mitigate these risks.

---

# 12. Important Concepts I Must Understand

List the most important concepts related to replay protection and nonces, such as:

- nonce
- replay attack
- challenge–response protocol
- session binding
- proof freshness.

Explain each briefly.

---

# 13. Practical Summary

Provide a **simple explanation of nonces and replay protection that I can explain in about 30 seconds during a hackathon presentation**.

The explanation must be beginner friendly and easy to remember.

```
---
# Prompt 6 — Security Model and Threat Analysis of the ZKP System
```bash

You are a senior cryptography engineer and a hackathon judge specializing in Zero Knowledge Proof systems.

I have built a system that uses:

- BBS+ signatures
- ZKP circuits (PLONK via snarkjs)
- Circom circuits
- credential verification between issuer, holder, and verifier.

Your task is to **teach me the security model of such a system so that I can confidently answer security-related questions during a hackathon presentation**.

Important instructions:

- Teach as if the student is a beginner in security engineering.
- Focus on practical understanding.
- Explain step-by-step.
- If something depends on the implementation, ask me to show the relevant file.

Your teaching must cover the following sections.

---

# 1. What a Security Model Is

Explain what a **security model** means in cryptographic systems.

Explain why it is important to define:

- what the system protects
- what attackers might try
- what assumptions are made.

Explain how hackathon judges often test whether participants understand their **security assumptions**.

---

# 2. System Actors and Trust Model

Explain the trust assumptions between:

- Issuer
- Holder
- Verifier.

Explain which entities are trusted and which are not.

Example questions to answer:

- Do we trust the holder?
- Do we trust the verifier?
- What happens if one actor behaves maliciously?

Explain clearly what each actor can and cannot do.

---

# 3. Potential Attackers

Explain the different types of attackers that might exist in such a system.

Examples:

- malicious holder
- malicious verifier
- external attacker
- impersonation attacker
- replay attacker.

Explain what each attacker might attempt.

---

# 4. What the System Protects

Explain what guarantees the system provides.

Examples include:

- holder cannot forge credentials
- attributes cannot be modified
- hidden attributes remain private
- verifier learns only allowed information
- proofs cannot be reused.

Explain how cryptography enforces these guarantees.

---

# 5. What the System Does NOT Protect

Explain what the system cannot guarantee.

Examples might include:

- compromised issuer keys
- user device compromise
- incorrect credential issuance
- malicious verifier logging information.

Explain why these are outside the system’s control.

---

# 6. Forgery Resistance

Explain why the holder **cannot forge credentials**.

Explain how:

- BBS+ signatures
- public key verification

prevent credential forgery.

Explain why the verifier can trust the signature.

---

# 7. Privacy Guarantees

Explain how the system protects user privacy.

Explain concepts such as:

- selective disclosure
- hidden attributes
- zero knowledge proofs.

Explain why the verifier cannot learn more than intended.

---

# 8. Unlinkability

Explain what **unlinkability** means.

Explain how ZKP systems prevent a verifier from linking multiple proofs to the same user.

Explain how:

- fresh randomness
- nonces
- context-based nullifiers

help achieve unlinkability.

---

# 9. Replay Protection

Explain how the system prevents replay attacks.

Explain the role of:

- nonces
- challenge-response
- session binding.

Explain what could happen if replay protection were missing.

---

# 10. Key Security Assumptions

Explain the key cryptographic assumptions behind the system.

Examples include:

- discrete logarithm hardness
- pairing-based cryptography security
- zkSNARK soundness.

Explain these in simple terms.

---

# 11. Hackathon Judge Questions

Provide at least **10 questions judges might ask about system security**.

Examples:

- What prevents a user from forging credentials?
- What happens if the issuer key leaks?
- Can the verifier track users?
- Can someone reuse a proof?

Provide clear answers for each question.

---

# 12. Limitations and Honest Answers

Explain limitations honestly.

Examples:

- trusted setup assumptions
- dependency on issuer honesty
- implementation complexity.

Explain how to answer these questions confidently during a hackathon.

---

# 13. Important Security Concepts I Must Understand

List the most important security concepts for this system, such as:

- threat model
- trust assumptions
- unlinkability
- forgery resistance
- replay protection.

Explain each briefly.

---

# 14. Practical Summary

Provide a **simple explanation of the system’s security model that I can explain in about 30 seconds during a hackathon presentation**.

The explanation must be beginner friendly and easy to remember.
```
---
# Prompt 7 — Libraries, Cryptographic Primitives, and Implementation Stack of the ZKP System
```bash

You are a senior cryptography engineer and a hackathon judge specializing in Zero Knowledge Proof systems.

I have built a system that uses technologies such as:

- BBS+ signatures
- ZK circuits using Circom
- PLONK proofs via snarkjs
- JavaScript / Node.js environment
- cryptographic hashing
- nonce generation and verification

Your task is to **teach me the implementation stack and the cryptographic primitives used in such a system**, so that I can confidently explain the technical implementation during a hackathon.

Important instructions:

- Teach as if the student is a beginner in applied cryptography and software systems.
- Focus on practical understanding.
- Explain step-by-step.
- If something depends on my implementation, ask me to show the relevant code file.

Your teaching must cover the following sections.

---

# 1. What an Implementation Stack Is

Explain what an **implementation stack** means in a cryptographic system.

Explain the idea that a system is composed of multiple layers such as:

- application logic
- cryptographic libraries
- ZKP frameworks
- low-level mathematical primitives.

Explain why understanding the stack is important for system design and debugging.

---

# 2. High-Level Architecture of the Stack

Explain how a typical ZKP credential system might be structured in layers:

1. Application layer  
2. Credential logic layer  
3. ZKP circuit layer  
4. Cryptographic library layer  
5. Mathematical primitive layer  

Explain what each layer is responsible for.

---

# 3. Circom and snarkjs

Explain the role of:

- Circom
- snarkjs

Explain what each one provides.

Explain how they are used for:

- writing circuits
- compiling circuits
- generating witnesses
- generating proofs
- verifying proofs.

Explain why these tools are widely used in ZKP projects.

---

# 4. BBS+ Signature Libraries

Explain the role of BBS+ libraries used in JavaScript systems.

Explain what these libraries typically provide:

- key generation
- credential signing
- proof generation
- proof verification.

Explain the typical flow of using these libraries in a credential system.

---

# 5. Cryptographic Primitives Used

Explain the main primitives used in systems like this:

- elliptic curve cryptography
- pairing-based cryptography
- hash functions
- random number generation.

Explain the role of each primitive.

Explain how these primitives support BBS+ signatures and ZKP systems.

---

# 6. Hash Functions

Explain what cryptographic hash functions are.

Explain their properties:

- determinism
- preimage resistance
- collision resistance.

Explain where hashes appear in systems like this:

- nullifier generation
- commitment schemes
- proof challenges.

---

# 7. Randomness and Secure Generators

Explain why secure randomness is important.

Explain how randomness is used for:

- nonces
- proof generation
- signature generation.

Explain the dangers of weak randomness.

---

# 8. File Artifacts in ZKP Systems

Explain common artifacts produced in ZKP workflows:

- `.r1cs`
- `.wasm`
- `.zkey`
- verification keys
- proof files.

Explain what each file contains and why it is needed.

---

# 9. Performance Considerations

Explain performance trade-offs in ZKP systems such as:

- proof generation time
- proof verification time
- circuit size
- memory usage.

Explain how developers typically optimize these factors.

---

# 10. Hackathon Judge Questions

Provide at least **10 questions judges might ask about implementation and libraries**.

Examples include:

- Why did you choose this library?
- Why use Circom instead of other frameworks?
- What cryptographic primitives are used internally?
- How expensive is proof generation?

Provide clear answers for each question.

---

# 11. Limitations of the Implementation

Explain possible limitations such as:

- dependency on external libraries
- limited documentation
- difficulty of debugging circuits
- ecosystem maturity.

Explain how to answer these concerns during a hackathon.

---

# 12. Important Implementation Concepts I Must Understand

List key implementation concepts such as:

- circuit compilation
- witness generation
- proof artifacts
- cryptographic libraries
- system layers.

Explain each briefly.

---

# 13. Practical Summary

Provide a **simple explanation of the implementation stack that I can explain in about 30 seconds during a hackathon presentation**.

The explanation must be beginner friendly and easy to remember.
```
---
# Prompt 8 — ZKP Circuit Logic, Predicates, and Statement Design
```bash

You are a senior Zero Knowledge Proof engineer and a hackathon judge.

I have built a system that uses:

- Circom circuits
- PLONK proofs
- BBS+ credentials

Your task is to teach me **how logical statements are represented and proven inside ZKP circuits**.

Teach this as if I am a beginner preparing for a hackathon presentation.

Explain clearly and step-by-step.

If some explanation depends on the circuit implementation, ask me to show the circuit file.

---

# 1. What a Predicate Is in ZKP

Explain what a **predicate** means in a ZKP system.

A predicate is a **condition about some data** that must be true.

Examples include:

- age ≥ 18
- attribute exists
- attribute equals another attribute
- value belongs to a list.

Explain how ZKP proves that the predicate is true **without revealing the underlying data**.

---

# 2. Why Predicates Are Used Instead of Revealing Data

Explain why ZKP systems prefer proving conditions instead of revealing attributes.

Example:

Instead of revealing:

age = 21

The system proves:
age ≥ 18

Explain the privacy advantages of this approach.

---

# 3. Common Predicates Used in ZKP Systems

Explain common predicates used in credential systems:

- equality proofs
- range proofs
- set membership
- existence proofs
- inequality proofs.

Explain each with simple examples.

---

# 4. Equality Proofs

Explain how circuits prove:
attribute_A == attribute_B

Explain how equality constraints work in arithmetic circuits.

Provide simple examples.

---

# 5. Range Proofs

Explain how circuits prove statements like:
age ≥ 18

Explain the idea of:

- comparisons
- bit decomposition
- constraint enforcement.

Explain why range proofs are common in identity verification.

---

# 6. Existence Proofs

Explain how a system proves that an attribute exists without revealing its value.

Explain how BBS+ signatures guarantee the attribute was signed.

Explain how circuits enforce constraints on hidden attributes.

---

# 7. Combining Multiple Predicates

Explain how circuits can prove multiple conditions together.

Example:

- age ≥ 18
- membership_status = valid
- nationality = allowed country.

Explain how circuits combine constraints.

---

# 8. Public Inputs vs Private Inputs

Explain the difference between:

- public inputs
- private inputs.

Explain why some values must be public for verification.

Explain why sensitive values remain private.

---

# 9. Constraint Systems

Explain what constraints are in circuits.

Example:
a * b = c

Explain how computations are converted into constraint systems.

Explain why constraints guarantee correctness.

---

# 10. Hackathon Judge Questions

Provide at least **10 questions judges might ask about circuit logic**.

Examples include:

- How do you prove age ≥ 18 without revealing age?
- What prevents incorrect inputs?
- Can someone bypass the circuit?

Provide clear answers.

---

# 11. Circuit Limitations

Explain challenges such as:

- large circuit sizes
- proving complexity
- difficulty of implementing complex logic.

Explain how developers deal with these limitations.

---

# 12. Key Concepts to Understand

List the most important circuit concepts:

- predicates
- constraints
- arithmetic circuits
- public inputs
- private inputs.

Explain each briefly.

---

# 13. Practical Summary

Provide a **simple explanation of how circuits prove statements without revealing data**, which I can present in **30 seconds during a hackathon presentation**.
```
