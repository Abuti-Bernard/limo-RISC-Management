export const REG_NAMES = [
  "lehe","letsibolo","mokou","sephara","khoele",
  "nakona1","nakona2","nakona3","letsete0","letsete1",
  "sephetho0","sephetho1","sephetho2","sephetho3","sephetho4",
  "sephetho5","sephetho6","sephetho7",
  "letsete2","letsete3","letsete4","letsete5","letsete6",
  "letsete7","letsete8","letsete9","letsete10","letsete11",
  "nakona4","nakona5","nakona6","nakona7"
] as const;

export const ALIASES = [
  "zero","ra","sp","gp","tp","t0","t1","t2","s0","s1",
  "a0","a1","a2","a3","a4","a5","a6","a7",
  "s2","s3","s4","s5","s6","s7","s8","s9","s10","s11",
  "t3","t4","t5","t6"
] as const;

export function parseRegister(token: string): number {
  const t = token.trim().toLowerCase();
  const m = /^x(\d+)$/.exec(t);
  if (m) {
    const n = Number(m[1]);
    if (n < 0 || n > 31) throw new Error(`register x${n} out of range (x0..x31)`);
    return n;
  }
  const i = REG_NAMES.indexOf(t as never);
  if (i >= 0) return i;
  const j = ALIASES.indexOf(t as never);
  if (j >= 0) return j;
  const near = REG_NAMES.find(n => n.startsWith(t[0] ?? ""));
  throw new Error(`unknown register '${token}'${near ? ` — did you mean '${near}'?` : ""}`);
}
