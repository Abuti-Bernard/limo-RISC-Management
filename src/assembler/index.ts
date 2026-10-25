import { ISA, PSEUDO } from "./isa.js";
import { parseRegister } from "./registers.js";
import { encodeR, encodeI, encodeS, encodeB, encodeShift, toHex, toBin } from "./encode.js";

export interface AsmLine {
  line: number;
  addr: number;
  text: string;
  mnemonic: string;
  word: number;
  hex: string;
  binary: string;
  fields: Record<string, number | string>;
}

export interface AssembleResult {
  lines: AsmLine[];
  labels: Record<string, number>;
  errors: { line: number; msg: string }[];
}

const stripComment = (l: string) => l.replace(/#.*/, "").replace(/\/\/.*/, "").trim();

function num(tok: string): number {
  let v = tok.trim();
  if (v.startsWith("+")) v = v.slice(1);
  if (/^-?0x[0-9a-f]+$/i.test(v)) {
    const neg = v.startsWith("-");
    const n = parseInt(neg ? v.slice(1) : v, 16);
    return neg ? -n : n;
  }
  if (!/^-?\d+$/.test(v)) throw new Error(`invalid number '${tok}'`);
  return Number(v);
}

const splitArgs = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);

const parseMem = (s: string) => {
  const m = /^(.+?)\s*\(\s*([^)]+)\s*\)$/.exec(s);
  if (!m) throw new Error(`expected offset(register), got '${s}'`);
  return { offset: num(m[1]), base: parseRegister(m[2]) };
};

export function assemble(source: string): AssembleResult {
  const errors: AssembleResult["errors"] = [];
  const labels: Record<string, number> = {};
  const parsed: { line: number; addr: number; text: string }[] = [];

  source.split(/\r?\n/).forEach((raw, i) => {
    let line = stripComment(raw);
    if (!line) return;
    const lm = /^([A-Za-z_]\w*)\s*:\s*(.*)$/.exec(line);
    if (lm) {
      const name = lm[1].toLowerCase();
      if (labels[name] !== undefined) {
        errors.push({ line: i + 1, msg: `duplicate label '${lm[1]}'` });
        return;
      }
      labels[name] = parsed.length * 4;
      line = lm[2].trim();
      if (!line) return;
    }
    const sp = line.search(/\s/);
    const mnem = (sp === -1 ? line : line.slice(0, sp)).toLowerCase();
    const rest = sp === -1 ? "" : line.slice(sp).trim();
    const args = splitArgs(rest);
    if (PSEUDO[mnem]) {
      parsed.push({ line: i + 1, addr: parsed.length * 4, text: PSEUDO[mnem](args) });
      return;
    }
    if (!ISA[mnem]) {
      errors.push({ line: i + 1, msg: `unknown mnemonic '${mnem}'` });
      return;
    }
    parsed.push({ line: i + 1, addr: parsed.length * 4, text: line });
  });

  const lines: AsmLine[] = [];
  for (const p of parsed) {
    const sp = p.text.search(/\s/);
    const mnem = (sp === -1 ? p.text : p.text.slice(0, sp)).toLowerCase();
    const rest = sp === -1 ? "" : p.text.slice(sp).trim();
    const args = splitArgs(rest);
    const e = ISA[mnem];
    try {
      let word = 0;
      const fields: AsmLine["fields"] = { opcode: e.opcode, funct3: e.funct3 };
      if (e.funct7 !== undefined) fields.funct7 = e.funct7;

      if (e.fmt === "R") {
        if (args.length !== 3) throw new Error(`${mnem} expects 3 operands`);
        const rd = parseRegister(args[0]);
        const rs1 = parseRegister(args[1]);
        const rs2 = parseRegister(args[2]);
        fields.rd = rd; fields.rs1 = rs1; fields.rs2 = rs2;
        word = encodeR(e, rd, rs1, rs2);
      } else if (mnem === "suthumetsa") {
        if (args.length !== 3) throw new Error("suthumetsa expects 3 operands");
        const rd = parseRegister(args[0]);
        const rs1 = parseRegister(args[1]);
        const shamt = num(args[2]);
        fields.rd = rd; fields.rs1 = rs1; fields.shamt = shamt;
        word = encodeShift(rd, rs1, shamt);
      } else if (e.fmt === "I" && (mnem === "bofa" || mnem === "qhoma")) {
        if (args.length !== 2) throw new Error(`${mnem} expects 2 operands`);
        const rd = parseRegister(args[0]);
        const m = parseMem(args[1]);
        fields.rd = rd; fields.rs1 = m.base; fields.imm = m.offset;
        word = encodeI(e, rd, m.base, m.offset);
      } else if (e.fmt === "I") {
        if (args.length !== 3) throw new Error("eketsa expects 3 operands");
        const rd = parseRegister(args[0]);
        const rs1 = parseRegister(args[1]);
        const imm = num(args[2]);
        fields.rd = rd; fields.rs1 = rs1; fields.imm = imm;
        word = encodeI(e, rd, rs1, imm);
      } else if (e.fmt === "S") {
        if (args.length !== 2) throw new Error("boloka expects 2 operands");
        const rs2 = parseRegister(args[0]);
        const m = parseMem(args[1]);
        fields.rs2 = rs2; fields.rs1 = m.base; fields.imm = m.offset;
        word = encodeS(e, m.base, rs2, m.offset);
      } else if (e.fmt === "B") {
        if (args.length !== 3) throw new Error(`${mnem} expects 3 operands`);
        const rs1 = parseRegister(args[0]);
        const rs2 = parseRegister(args[1]);
        let target: number;
        const lbl = args[2].toLowerCase();
        if (labels[lbl] !== undefined) target = labels[lbl];
        else target = num(args[2]);
        const offset = target - p.addr;
        fields.rs1 = rs1; fields.rs2 = rs2; fields.offset = offset;
        word = encodeB(e, rs1, rs2, offset);
      }

      lines.push({
        line: p.line,
        addr: p.addr,
        text: p.text,
        mnemonic: mnem,
        word,
        hex: toHex(word),
        binary: toBin(word),
        fields,
      });
    } catch (err: unknown) {
      errors.push({ line: p.line, msg: (err as Error).message });
    }
  }

  return { lines, labels, errors };
}
