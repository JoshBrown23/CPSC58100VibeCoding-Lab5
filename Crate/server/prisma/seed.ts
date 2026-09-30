import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// A stand-in "logged in" user until real auth exists — see
// src/middleware/attachDefaultUser.ts, which every request is currently
// treated as. id: 1 is asserted explicitly so seeding is safe to re-run
// (the upsert below always targets the same row instead of creating a
// new guest user on every run).
const GUEST_USER = {
  id: 1,
  username: "guest",
  email: "guest@example.com",
  // Not a real password — there's no login flow yet, so nothing checks
  // this. It exists only so the column is never left empty.
  passwordHash: "not-a-real-hash",
};

// Reproduces the three albums that used to be hardcoded as
// STARTER_COLLECTION on the frontend, so switching to the database
// doesn't make the demo collection disappear.
const STARTER_ALBUMS = [
  { title: "Rumours", artistName: "Fleetwood Mac", releaseYear: 1977, format: "Vinyl" as const },
  { title: "Abbey Road", artistName: "The Beatles", releaseYear: 1969, format: "Vinyl" as const },
  { title: "Thriller", artistName: "Michael Jackson", releaseYear: 1982, format: "CD" as const },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { id: GUEST_USER.id },
    update: {},
    create: GUEST_USER,
  });

  for (const item of STARTER_ALBUMS) {
    const artist = await prisma.artist.upsert({
      where: { artistName: item.artistName },
      update: {},
      create: { artistName: item.artistName },
    });

    const album = await prisma.album.upsert({
      where: { title_artistId: { title: item.title, artistId: artist.id } },
      update: {},
      create: {
        title: item.title,
        artistId: artist.id,
        releaseYear: item.releaseYear,
      },
    });

    await prisma.userCollection.upsert({
      where: {
        userId_albumId_format: {
          userId: user.id,
          albumId: album.id,
          format: item.format,
        },
      },
      update: {},
      create: { userId: user.id, albumId: album.id, format: item.format },
    });
  }

  console.log("Seed complete: guest user + 3 starter albums.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
