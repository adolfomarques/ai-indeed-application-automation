// scripts/kv-test.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { kv } from "@vercel/kv";

async function test() {
  await kv.set("test:key", "hello-world");
  const val = await kv.get<string>("test:key");
  console.log("Value:", val);
  await kv.del("test:key");
}

test().catch(console.error);
