import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_menu_items_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_site_settings_currency" AS ENUM('PHP', 'USD', 'EUR', 'GBP');
  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "reset_password_requested_at" timestamp(3) with time zone,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "media" (
    "id" serial PRIMARY KEY NOT NULL,
    "alt" varchar NOT NULL,
    "source_key" varchar,
    "prefix" varchar DEFAULT '',
    "_objectkey" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric,
    "sizes_preview_url" varchar,
    "sizes_preview_width" numeric,
    "sizes_preview_height" numeric,
    "sizes_preview_mime_type" varchar,
    "sizes_preview_filesize" numeric,
    "sizes_preview_filename" varchar
  );

  CREATE TABLE "menu_items_flavor_notes" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "note" varchar NOT NULL
  );

  CREATE TABLE "menu_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "emphasis" varchar,
    "slug" varchar NOT NULL,
    "price" numeric NOT NULL,
    "description" varchar,
    "details" varchar,
    "eyebrow" varchar,
    "image_id" integer,
    "image_caption" varchar,
    "action_label" varchar DEFAULT 'A little more',
    "order" numeric DEFAULT 0,
    "status" "enum_menu_items_status" DEFAULT 'draft' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "menu_items_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "homepage" (
    "id" serial PRIMARY KEY NOT NULL,
    "hero_kicker" varchar DEFAULT 'A LITTLE SLOWER. A LITTLE BETTER.',
    "hero_first_word" varchar DEFAULT 'SLOW',
    "hero_second_word" varchar DEFAULT 'DOWN.',
    "hero_caption" varchar DEFAULT 'The world can wait.
  Really good coffee can’t.',
    "hero_badge" varchar DEFAULT 'GOOD COFFEE · NO SHORTCUTS · ',
    "origin_label" varchar DEFAULT '01 / GOOD THINGS HAVE GOOD ROOTS',
    "origin_title" varchar DEFAULT 'A little',
    "origin_emphasis" varchar DEFAULT 'obsession.',
    "origin_closing" varchar DEFAULT 'In every bean.',
    "origin_body" varchar DEFAULT 'Before the first sip, there’s a whole story. Thoughtfully chosen beans. People who care. A thousand tiny details that make a big difference.',
    "origin_footnote" varchar DEFAULT 'SOURCED WITH INTENTION. ALWAYS.',
    "roast_label" varchar DEFAULT '02 / NOTHING GOOD IS RUSHED',
    "roast_first_word" varchar DEFAULT 'HEAT.',
    "roast_second_word" varchar DEFAULT 'HEART.',
    "roast_third_word" varchar DEFAULT 'HANDS.',
    "roast_caption" varchar DEFAULT 'Small batches.
  Patient hands.
  A little bit of alchemy.',
    "roast_temperature" numeric DEFAULT 93,
    "roast_extraction_time" numeric DEFAULT 28,
    "pause_label" varchar DEFAULT '03 / THIS ONE’S JUST FOR YOU',
    "pause_title" varchar DEFAULT 'A moment.',
    "pause_emphasis" varchar DEFAULT 'All yours.',
    "pause_body" varchar DEFAULT 'No rush. No noise.
  Just you, and something good.',
    "menu_heading_label" varchar DEFAULT '04 / FOLLOW YOUR GOOD TASTE',
    "menu_heading_title" varchar DEFAULT 'Find your',
    "menu_heading_emphasis" varchar DEFAULT 'feeling.',
    "menu_heading_footer" varchar DEFAULT 'GOOD TASTE COMES NATURALLY.',
    "visit_label" varchar DEFAULT '05 / THERE’S A PLACE FOR YOU HERE',
    "visit_title" varchar DEFAULT 'Stay a',
    "visit_emphasis" varchar DEFAULT 'little.',
    "visit_body" varchar DEFAULT 'Bring a book. Bring a friend.
  We’ll take care of the coffee.',
    "visit_image_id" integer,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_hours" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "days" varchar NOT NULL,
    "time" varchar NOT NULL
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "brand_name" varchar DEFAULT 'ember.' NOT NULL,
    "title" varchar DEFAULT 'EMBER — Slow is a superpower.',
    "description" varchar DEFAULT 'Specialty coffee. Everyday magic. A little slower. A little better.',
    "currency" "enum_site_settings_currency" DEFAULT 'PHP' NOT NULL,
    "location_label" varchar DEFAULT 'Your neighborhood, soon.',
    "address" varchar,
    "contact_email" varchar,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items_flavor_notes" ADD CONSTRAINT "menu_items_flavor_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_items_fk" FOREIGN KEY ("menu_items_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_visit_image_id_media_id_fk" FOREIGN KEY ("visit_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_hours" ADD CONSTRAINT "site_settings_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "media_source_key_idx" ON "media" USING btree ("source_key");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_preview_sizes_preview_filename_idx" ON "media" USING btree ("sizes_preview_filename");
  CREATE INDEX "menu_items_flavor_notes_order_idx" ON "menu_items_flavor_notes" USING btree ("_order");
  CREATE INDEX "menu_items_flavor_notes_parent_id_idx" ON "menu_items_flavor_notes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "menu_items_slug_idx" ON "menu_items" USING btree ("slug");
  CREATE INDEX "menu_items_image_idx" ON "menu_items" USING btree ("image_id");
  CREATE INDEX "menu_items_updated_at_idx" ON "menu_items" USING btree ("updated_at");
  CREATE INDEX "menu_items_created_at_idx" ON "menu_items" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_menu_items_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_items_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_visit_visit_image_idx" ON "homepage" USING btree ("visit_image_id");
  CREATE INDEX "site_settings_hours_order_idx" ON "site_settings_hours" USING btree ("_order");
  CREATE INDEX "site_settings_hours_parent_id_idx" ON "site_settings_hours" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "menu_items_flavor_notes" CASCADE;
  DROP TABLE "menu_items" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "site_settings_hours" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_menu_items_status";
  DROP TYPE "public"."enum_site_settings_currency";`)
}
