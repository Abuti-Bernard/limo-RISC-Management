export type Fmt = "R" | "I" | "S" | "B";

export interface IsaEntry {
  mnemonic: string;
  rv32i: string;
  fmt: Fmt;
  opcode: number;
  funct3: number;
  funct7?: number;
}

export const ISA: Record<string, IsaEntry> = {
  kopanya:    { mnemonic: "kopanya",    rv32i: "add",  fmt: "R", opcode: 0b0110011, funct3: 0b000, funct7: 0b0000000 },
  tlosa:      { mnemonic: "tlosa",      rv32i: "sub",  fmt: "R", opcode: 0b0110011, funct3: 0b000, funct7: 0b0100000 },
  eketsa:     { mnemonic: "eketsa",     rv32i: "addi", fmt: "I", opcode: 0b0010011, funct3: 0b000 },
  kapa:       { mnemonic: "kapa",       rv32i: "or",   fmt: "R", opcode: 0b0110011, funct3: 0b110, funct7: 0b0000000 },
  le:         { mnemonic: "le",         rv32i: "and",  fmt: "R", opcode: 0b0110011, funct3: 0b111, funct7: 0b0000000 },
  suthumetsa: { mnemonic: "suthumetsa", rv32i: "slli", fmt: "I", opcode: 0b0010011, funct3: 0b001 },
  bofa:       { mnemonic: "bofa",       rv32i: "lw",   fmt: "I", opcode: 0b0000011, funct3: 0b010 },
  boloka:     { mnemonic: "boloka",     rv32i: "sw",   fmt: "S", opcode: 0b0100011, funct3: 0b010 },
  lekana:     { mnemonic: "lekana",     rv32i: "beq",  fmt: "B", opcode: 0b1100011, funct3: 0b000 },
  ekholo:     { mnemonic: "ekholo",     rv32i: "bge",  fmt: "B", opcode: 0b1100011, funct3: 0b101 },
  qhoma:      { mnemonic: "qhoma",      rv32i: "jalr", fmt: "I", opcode: 0b1100111, funct3: 0b000 },
};

export const PSEUDO: Record<string, (a: string[]) => string> = {
  bofahh:   a => `eketsa ${a[0]}, lehe, ${a[1]}`,
  chechisa: a => `eketsa ${a[0]}, ${a[1]}, 0`,
};
