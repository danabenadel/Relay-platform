-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."oauth_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "scope" TEXT[],
    "email" TEXT,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."services" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."actions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "params" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reactions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "params" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."areas" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_id" INTEGER NOT NULL,
    "reaction_id" INTEGER NOT NULL,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_triggered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_tokens_user_id_service_name_key" ON "public"."oauth_tokens"("user_id", "service_name");

-- AddForeignKey
ALTER TABLE "public"."oauth_tokens" ADD CONSTRAINT "oauth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddColumn
ALTER TABLE "public"."users" ADD COLUMN "name" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "public"."services"("name");

-- CreateIndex
CREATE UNIQUE INDEX "actions_serviceId_name_key" ON "public"."actions"("service_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_serviceId_name_key" ON "public"."reactions"("service_id", "name");

-- AddForeignKey
ALTER TABLE "public"."actions" ADD CONSTRAINT "actions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reactions" ADD CONSTRAINT "reactions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."areas" ADD CONSTRAINT "areas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."areas" ADD CONSTRAINT "areas_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."areas" ADD CONSTRAINT "areas_reaction_id_fkey" FOREIGN KEY ("reaction_id") REFERENCES "public"."reactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

