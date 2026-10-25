import { describe, it, expect } from "vitest";
import { assemble } from "../../src/assembler/index.js";

const CASES: { asm: string; hex: number }[] = [
  { asm: "kopanya x7, x5, x6",   hex: 0x006283B3 },
  { asm: "tlosa x7, x5, x6",     hex: 0x406283B3 },
  { asm: "eketsa x7, x5, 12",    hex: 0x00C28393 },
  { asm: "kapa x7, x5, x6",      hex: 0x0062E3B3 },
  { asm: "le x7, x5, x6",        hex: 0x0062F3B3 },
  { asm: "suthumetsa x7, x5, 3", hex: 0x00329393 },
  { asm: "bofa x7, 8(x5)",       hex: 0x0082A383 },
  { asm: "boloka x7, 8(x5)",     hex: 0x0072A423 },
  { asm: "lekana x5, x6, +8",    hex: 0x00628463 },
  { asm: "ekholo x5, x6, +8",    hex: 0x0062D463 },
  { asm: "qhoma x0, 0(x1)",      hex: 0x00008067 },
  { asm: "bofahh x8, 0",         hex: 0x00000413 },
  { asm: "chechisa x10, x8",     hex: 0x00040513 },
];

describe("assembler encoding", () => {
  for (const c of CASES) {
    it(`${c.asm} → 0x${c.hex.toString(16).toUpperCase().padStart(8, "0")}`, () => {
      const r = assemble(c.asm);
      expect(r.errors).toEqual([]);
      expect(r.lines).toHaveLength(1);
      expect(r.lines[0].word >>> 0).toBe(c.hex >>> 0);
    });
  }
});
