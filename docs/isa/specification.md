# LIMO ISA Specification — M2 Freeze

**Status:** FROZEN at M2. Any change after this point requires a version bump and re-running `npm test`.

**Changes vs M1:** summarised in §7.

**Machine-readable table:** `docs/isa/limo-isa.json`.

---

## 1. Overview

| Aspect | Specification | Rationale |
|---|---|---|
| Architecture style | 32-bit load-store CPU derived from RV32I | Only `bofa`/`boloka` touch memory |
| Register bank | 32 x 32-bit GPRs (`x0`-`x31`); PC separate | 5-bit register fields |
| Addressing modes | Register, immediate, base + signed offset, PC-relative branches | R/I/S/B forms |
| Memory | Byte-addressed, little-endian, word-aligned | Aligned 32-bit words |
| Memory capacity | 4 KiB instruction memory (1024 words) + 4 KiB data memory (1024 words) | Fits B7 budget; sufficient for examples |
| Instruction formats | Fixed 32-bit: R, I, S, B | Regular field placement |
| Departures from RV32I | Sesotho mnemonics; subset of 11 instructions; 2 pseudoinstructions | Binary encodings remain RV32I-compatible |
| Branch resolution stage | ID (not EX) | 1-cycle taken-branch penalty (Ripes uses EX, 2-cycle); explained in M5 |

---

## 2. Register File

| Number | Sesotho name | Alias / type | Purpose |
|---|---|---|---|
| x0 | `lehe` | zero / GPR (fixed) | Always 0; writes ignored |
| x1 | `letsibolo` | ra / GPR | Return address |
| x2 | `mokou` | sp / GPR | Stack pointer |
| x3 | `sephara` | gp / GPR | Global pointer |
| x4 | `khoele` | tp / GPR | Thread pointer |
| x5-x7 | `nakona1`-`nakona3` | t0-t2 / GPR | Temporaries |
| x8-x9 | `letsete0`-`letsete1` | s0-s1 / GPR | Saved |
| x10-x17 | `sephetho0`-`sephetho7` | a0-a7 / GPR | Arguments / results |
| x18-x27 | `letsete2`-`letsete11` | s2-s11 / GPR | Saved |
| x28-x31 | `nakona4`-`nakona7` | t3-t6 / GPR | Temporaries |
| PC | `mokopu` | SPR | Instruction address (outside GPR file) |

**Register rationale:** 32 registers requires 5-bit `rd`/`rs1`/`rs2` fields. Compared with a 16-register design (4-bit fields), this costs 3 extra encoding bits per instruction and 2 extra comparator bits in the forwarding unit, but reduces register pressure. Quantified measurement deferred to M5 test report.

**Naming note:** `x5`-`x7` are named `nakona1`-`nakona3` (LIMO departure from RV32I's `t0`-`t2` numbering). `x28`-`x31` continue as `nakona4`-`nakona7`. LIMO is *derived from* RV32I, not identical.

---

## 3. Instruction Formats


R-type: funct7[31:25] | rs2[24:20] | rs1[19:15] | funct3[14:12] | rd[11:7] | opcode[6:0]
I-type: imm[31:20] | rs1[19:15] | funct3[14:12] | rd[11:7] | opcode[6:0]
S-type: imm[31:25] | rs2[24:20] | rs1[19:15] | funct3[14:12] | imm[11:7] | opcode[6:0]
B-type: imm[31] | imm[30:25] | rs2[24:20] | rs1[19:15] | funct3[14:12] | imm[11:8] | imm[7] | opcode[6:0]

**Immediate ranges:**
- I-type (signed): -2048 to +2047
- I-type shift (`suthumetsa`): shamt 0-31
- S-type (signed): -2048 to +2047
- B-type (signed, PC-relative, even): -4096 to +4094

---

## 4. Authoritative Instruction Encoding Table

| # | Mnemonic | Meaning | Syntax | Operation | Fmt | RV32I | Opcode | funct3 | funct7 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `kopanya` | combine / add | `rd, rs1, rs2` | R[rd] <- R[rs1] + R[rs2] | R | add | 0110011 | 000 | 0000000 |
| 2 | `tlosa` | subtract | `rd, rs1, rs2` | R[rd] <- R[rs1] - R[rs2] | R | sub | 0110011 | 000 | 0100000 |
| 3 | `eketsa` | increase / add immediate | `rd, rs1, imm` | R[rd] <- R[rs1] + imm | I | addi | 0010011 | 000 | - |
| 4 | `kapa` | or | `rd, rs1, rs2` | R[rd] <- R[rs1] OR R[rs2] | R | or | 0110011 | 110 | 0000000 |
| 5 | `le` | and | `rd, rs1, rs2` | R[rd] <- R[rs1] AND R[rs2] | R | and | 0110011 | 111 | 0000000 |
| 6 | `suthumetsa` | shift left | `rd, rs1, shamt` | R[rd] <- R[rs1] << shamt | I | slli | 0010011 | 001 | 0000000 |
| 7 | `bofa` | load word | `rd, imm(rs1)` | R[rd] <- M[R[rs1]+imm] | I | lw | 0000011 | 010 | - |
| 8 | `boloka` | store word | `rs2, imm(rs1)` | M[R[rs1]+imm] <- R[rs2] | S | sw | 0100011 | 010 | - |
| 9 | `lekana` | equal (branch) | `rs1, rs2, offset` | if R[rs1]==R[rs2]: PC<-PC+offset | B | beq | 1100011 | 000 | - |
| 10 | `ekholo` | greater or equal (branch) | `rs1, rs2, offset` | if signed R[rs1]>=R[rs2]: PC<-PC+offset | B | bge | 1100011 | 101 | - |
| 11 | `qhoma` | jump via register | `rd, imm(rs1)` | R[rd]<-PC+4; PC<-(R[rs1]+imm)&~1 | I | jalr | 1100111 | 000 | - |

### Pseudoinstructions

| Mnemonic | Syntax | Expansion |
|---|---|---|
| `bofahh` | `rd, imm` | `eketsa rd, lehe, imm` |
| `chechisa` | `rd, rs` | `eketsa rd, rs, 0` |

Both expand to exactly one 32-bit instruction.

---

## 5. Worked Encoding Examples

### 5.1 `kopanya x7, x5, x6` -> `0x006283B3`

### 5.2 `tlosa x7, x5, x6` -> `0x406283B3`

### 5.3 `eketsa x7, x5, 12` -> `0x00C28393`

### 5.4 `kapa x7, x5, x6` -> `0x0062E3B3`

### 5.5 `le x7, x5, x6` -> `0x0062F3B3`

### 5.6 `suthumetsa x7, x5, 3` -> `0x00329393`

### 5.7 `bofa x7, 8(x5)` -> `0x0082A383`

### 5.8 `boloka x7, 8(x5)` -> `0x0072A423`

### 5.9 `lekana x5, x6, +8` -> `0x00628463`

### 5.10 `ekholo x5, x6, +8` -> `0x0062D463`

### 5.11 `qhoma x0, 0(x1)` -> `0x00008067`

### 5.12 `bofahh x8, 0` -> `0x00000413`

### 5.13 `chechisa x10, x8` -> `0x00040513`

### 5.14 Assembler expected-hex summary

The 13 values above are the test cases in `tests/assembler/encoding.test.ts`.

---

## 6. Lexical Rules

| Rule | Specification |
|---|---|
| Case | Mnemonics and register names are lowercase only |
| Register syntax | `x0`-`x31` or Sesotho name; both accepted |
| Immediates | Decimal (`12`, `-5`), hex (`0x0C`, `-0x5`), optional leading `+` |
| Labels | `name:` at start of line; may share line with an instruction |
| Comments | `#` to end of line; `//` also accepted |
| Apostrophes | `ts'`, `ch'` are part of the mnemonic/identifier; `'` is never a quote (no string literals). Identifier regex: `^[a-z][a-z0-9']*$` |
| Whitespace | Commas optional; parentheses in memory operands required: `8(x5)` |
| Pseudoinstructions | `bofahh`, `chechisa` expand to one instruction each |

---

## 7. Changelog vs M1 (D1-feedback compliance)

| # | M1 defect | Correction | Evidence |
|---|---|---|---|
| 1 | Mnemonic `tiosa` | Renamed to `tlosa` | Sec 4 row 2 |
| 2 | `tlosa` funct7 = 0000000 | Corrected to 0100000 | Sec 5.2; test case 2 |
| 3 | `kapa` funct3 = 000 | Corrected to 110 | Sec 5.4; test case 4 |
| 4 | `le` funct3 = 000 | Corrected to 111 | Sec 5.5; test case 5 |
| 5 | `bofa` unencoded | Added 0x0082A383 | Sec 5.7; test case 7 |
| 6 | `qhoma` unencoded | Added 0x00008067 | Sec 5.11; test case 11 |
| 7 | `ekholo` unencoded | Added 0x0062D463 | Sec 5.10; test case 10 |
| 8 | Typo `letisbolo` | Corrected to `letsibolo` | Sec 6 |
| 9 | Memory capacity unspecified | Frozen 4 KiB IMEM + 4 KiB DMEM | Sec 1 |
| 10 | Pseudoinstruction expansion undocumented | Formalised in Sec 4 | Pseudo table |
| 11 | Register naming `nakonaa1` | Normalised to `nakona1` | Sec 2 |
| 12 | Sec 5.13/5.14 `chechisa` as 0x00050413 | Corrected to 0x00040513 (transposed nibbles) | Sec 5.13; test case 13 |
