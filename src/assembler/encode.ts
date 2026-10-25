import { IsaEntry } from "./isa.js";

export function encodeR(e: IsaEntry, rd: number, rs1: number, rs2: number): number {
  return (((e.funct7 ?? 0) & 0x7f) << 25)
       | ((rs2 & 0x1f) << 20)
       | ((rs1 & 0x1f) << 15)
       | ((e.funct3 & 0x7) << 12)
       | ((rd & 0x1f) << 7)
       | (e.opcode & 0x7f);
}

export function encodeI(e: IsaEntry, rd: number, rs1: number, imm: number): number {
  if (imm < -2048 || imm > 2047) throw new Error(`I-immediate ${imm} out of range [-2048, 2047]`);
  const u = imm & 0xfff;
  return (u << 20)
       | ((rs1 & 0x1f) << 15)
       | ((e.funct3 & 0x7) << 12)
       | ((rd & 0x1f) << 7)
       | (e.opcode & 0x7f);
}

export function encodeShift(rd: number, rs1: number, shamt: number): number {
  if (shamt < 0 || shamt > 31) throw new Error(`shamt ${shamt} out of range [0, 31]`);
  return (0 << 25)
       | ((shamt & 0x1f) << 20)
       | ((rs1 & 0x1f) << 15)
       | (0b001 << 12)
       | ((rd & 0x1f) << 7)
       | 0b0010011;
}

export function encodeS(e: IsaEntry, rs1: number, rs2: number, imm: number): number {
  if (imm < -2048 || imm > 2047) throw new Error(`S-immediate ${imm} out of range [-2048, 2047]`);
  const u = imm & 0xfff;
  const hi = (u >> 5) & 0x7f;
  const lo = u & 0x1f;
  return (hi << 25)
       | ((rs2 & 0x1f) << 20)
       | ((rs1 & 0x1f) << 15)
       | ((e.funct3 & 0x7) << 12)
       | (lo << 7)
       | (e.opcode & 0x7f);
}

export function encodeB(e: IsaEntry, rs1: number, rs2: number, offset: number): number {
  if (offset % 2 !== 0) throw new Error(`branch offset ${offset} is odd (must be even)`);
  if (offset < -4096 || offset > 4094) throw new Error(`B-offset ${offset} out of range [-4096, 4094]`);
  const u = offset & 0x1fff;
  const b12 = (u >> 12) & 1;
  const b11 = (u >> 11) & 1;
  const b10_5 = (u >> 5) & 0x3f;
  const b4_1 = (u >> 1) & 0xf;
  return (b12 << 31)
       | (b10_5 << 25)
       | ((rs2 & 0x1f) << 20)
       | ((rs1 & 0x1f) << 15)
       | ((e.funct3 & 0x7) << 12)
       | (b4_1 << 8)
       | (b11 << 7)
       | (e.opcode & 0x7f);
}

export const toHex = (w: number): string =>
  "0x" + (w >>> 0).toString(16).toUpperCase().padStart(8, "0");

export const toBin = (w: number): string =>
  (w >>> 0).toString(2).padStart(32, "0");
