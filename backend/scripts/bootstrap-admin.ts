import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/database/generated/client';
import { hashPassword } from '../src/modules/admin/security';

async function hidden(prompt: string): Promise<string> {
  if (!stdin.isTTY || !stdout.isTTY) throw new Error('Bootstrap requires an interactive terminal so password entry can remain hidden.');
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  return await new Promise((resolve, reject) => {
    let value = '';
    const onData = (chunk: Buffer) => {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003') { cleanup(); reject(new Error('Bootstrap cancelled.')); return; }
        if (character === '\r' || character === '\n') { cleanup(); resolve(value); return; }
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else if (character >= ' ') value += character;
      }
    };
    const cleanup = () => { stdin.off('data', onData); stdin.setRawMode(false); stdin.pause(); stdout.write('\n'); };
    stdin.on('data', onData);
  });
}

async function run() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const rl = createInterface({ input: stdin, output: stdout });
  const name = (await rl.question('Super administrator name: ')).trim();
  const email = (await rl.question('Super administrator email: ')).trim().toLowerCase();
  rl.close();
  if (!name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid name and email address.');
  const password = await hidden('Password (15–128 characters, hidden): ');
  const confirmation = await hidden('Confirm password (hidden): ');
  if (password.length < 15 || password.length > 128 || password !== confirmation) throw new Error('Passwords must match and be 15–128 characters.');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const existingSuperAdmin = await prisma.adminUser.findFirst({ where: { role: 'SUPER_ADMIN' }, select: { id: true } });
    if (existingSuperAdmin) throw new Error('A super administrator already exists; bootstrap cannot create or elevate another account.');
    const duplicate = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
    if (duplicate) throw new Error('That email already belongs to an administrator; bootstrap will not elevate it.');
    await prisma.adminUser.create({ data: { name, email, passwordHash: await hashPassword(password), role: 'SUPER_ADMIN' } });
    stdout.write('Initial super administrator created successfully.\n');
  } finally {
    password.replace(/./g, '\0');
    confirmation.replace(/./g, '\0');
    await prisma.$disconnect();
  }
}

run().catch((error: unknown) => {
  stdout.write(`${error instanceof Error ? error.message : 'Bootstrap failed.'}\n`);
  process.exitCode = 1;
});
