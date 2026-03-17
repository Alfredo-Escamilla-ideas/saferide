import { neon } from "@neondatabase/serverless";

function getDB() {
  return neon(process.env.DATABASE_URL!);
}

export default getDB;
