-- CreateEnum
CREATE TYPE "MediaFormat" AS ENUM ('CD', 'Vinyl');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" SERIAL NOT NULL,
    "artist_name" TEXT NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "releaseYear" INTEGER,
    "genre" TEXT,
    "cover_image_url" TEXT,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_collection" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "format" "MediaFormat" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "artists_artist_name_key" ON "artists"("artist_name");

-- CreateIndex
CREATE INDEX "albums_artist_id_idx" ON "albums"("artist_id");

-- CreateIndex
CREATE UNIQUE INDEX "albums_title_artist_id_key" ON "albums"("title", "artist_id");

-- CreateIndex
CREATE INDEX "user_collection_user_id_idx" ON "user_collection"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_collection_user_id_album_id_format_key" ON "user_collection"("user_id", "album_id", "format");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collection" ADD CONSTRAINT "user_collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_collection" ADD CONSTRAINT "user_collection_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;
