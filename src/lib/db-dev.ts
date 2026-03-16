/**
 * db-dev.ts
 * Base de datos local en JSON para desarrollo sin Supabase.
 * Solo se usa cuando NEXT_PUBLIC_SUPABASE_URL no está configurado.
 */

import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), ".dev-db.json");

interface User {
  id: string;
  name: string;
  dni: string;
  phone: string;
  role: "driver" | "passenger";
  certificate_issuer: string;
  certificate_expires_at: string;
  active: boolean;
  blocked: boolean;
  last_login?: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  plate: string;
  active: boolean;
}

interface DevDB {
  users: User[];
  vehicles: Vehicle[];
}

function readDB(): DevDB {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], vehicles: [] };
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDB(db: DevDB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function randomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const devDB = {
  users: {
    findByDNI: (dni: string) => readDB().users.find((u) => u.dni === dni) ?? null,
    findById: (id: string) => readDB().users.find((u) => u.id === id) ?? null,
    insert: (data: Omit<User, "id" | "created_at" | "blocked">) => {
      const db = readDB();
      const user: User = { ...data, id: randomId(), blocked: false, created_at: new Date().toISOString() };
      db.users.push(user);
      writeDB(db);
      return user;
    },
    update: (id: string, data: Partial<User>) => {
      const db = readDB();
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx !== -1) { db.users[idx] = { ...db.users[idx], ...data }; writeDB(db); }
    },
  },
  vehicles: {
    insert: (data: Omit<Vehicle, "id">) => {
      const db = readDB();
      const v: Vehicle = { ...data, id: randomId() };
      db.vehicles.push(v);
      writeDB(db);
      return v;
    },
  },
};
