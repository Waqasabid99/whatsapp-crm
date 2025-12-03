/*
  Warnings:

  - The values [MAX_AGENTS,MAX_MESSAGES_PER_MONTH,MAX_TEMPLATES,MAX_CAMPAIGNS,HAS_BOT,HAS_CAMPAIGN,HAS_MULTIPLE_WHATSAPP_ACCOUNTS] on the enum `FeatureKey` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeatureKey_new" AS ENUM ('MESSAGES_PER_MONTH', 'WHATSAPP_ACCOUNTS', 'AI_CHATBOT', 'AUTOMATION_LEVEL', 'SUPPORT_LEVEL', 'MESSAGE_TEMPLATES', 'ANALYTICS_LEVEL', 'CRM_INTEGRATIONS', 'TEAM_MEMBERS', 'CUSTOM_BRANDING', 'API_ACCESS');
ALTER TABLE "FeatureLimit" ALTER COLUMN "key" TYPE "FeatureKey_new" USING ("key"::text::"FeatureKey_new");
ALTER TABLE "Usage" ALTER COLUMN "key" TYPE "FeatureKey_new" USING ("key"::text::"FeatureKey_new");
ALTER TYPE "FeatureKey" RENAME TO "FeatureKey_old";
ALTER TYPE "FeatureKey_new" RENAME TO "FeatureKey";
DROP TYPE "public"."FeatureKey_old";
COMMIT;

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
