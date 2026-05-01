/*
  Warnings:

  - You are about to drop the column `payload` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `accepted` on the `Invite` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `placeholders` on the `Template` table. All the data in the column will be lost.
  - You are about to alter the column `count` on the `Usage` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the column `processedById` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `WhatsAppAccount` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[keyHash]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[botId,key]` on the table `ChatbotNode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspaceId,name,language]` on the table `Template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyPrefix` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Made the column `totalRecipients` on table `Campaign` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sentCount` on table `Campaign` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `ChatbotNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Made the column `language` on table `Template` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Template` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `WhatsAppAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timezone` on table `Workspace` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CampaignContactStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'OPTED_OUT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_MESSAGE', 'CONVERSATION_ASSIGNED', 'CONVERSATION_RESOLVED', 'CAMPAIGN_COMPLETED', 'CAMPAIGN_FAILED', 'AGENT_JOINED', 'AGENT_LEFT', 'SUBSCRIPTION_EXPIRING', 'SUBSCRIPTION_EXPIRED', 'WEBHOOK_FAILED', 'CHATBOT_HANDOFF');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ChatbotHandoffReason" AS ENUM ('USER_REQUESTED', 'NO_MATCH', 'MAX_TURNS_REACHED', 'AGENT_TRIGGERED', 'ERROR');

-- CreateEnum
CREATE TYPE "AssignmentStrategy" AS ENUM ('ROUND_ROBIN', 'LOAD_BALANCE', 'LEAST_ACTIVE');

-- AlterEnum
ALTER TYPE "FeatureKey" ADD VALUE 'WORKSPACES';

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookEvent" DROP CONSTRAINT "WebhookEvent_processedById_fkey";

-- DropIndex
DROP INDEX "ApiKey_workspaceId_idx";

-- DropIndex
DROP INDEX "AuditLog_workspaceId_idx";

-- DropIndex
DROP INDEX "ChatbotNode_botId_key_idx";

-- DropIndex
DROP INDEX "Subscription_workspaceId_idx";

-- DropIndex
DROP INDEX "Template_workspaceId_approved_idx";

-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "keyPrefix" TEXT NOT NULL,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "caption" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mediaId" TEXT,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "payload",
ADD COLUMN     "changes" JSONB,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "audienceGroupId" TEXT,
ADD COLUMN     "deliveredCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "optedOutCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "readCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timezone" TEXT,
ALTER COLUMN "totalRecipients" SET NOT NULL,
ALTER COLUMN "sentCount" SET NOT NULL;

-- AlterTable
ALTER TABLE "Chatbot" ADD COLUMN     "triggerKeywords" TEXT[],
ADD COLUMN     "triggerOnNew" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ChatbotNode" ADD COLUMN     "position" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "optOutAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "tags",
ADD COLUMN     "chatbotId" TEXT,
ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "isBotActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastInboundAt" TIMESTAMP(3),
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "accepted",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "invitedBy" TEXT,
ADD COLUMN     "status" "InviteStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "meta",
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxConcurrentChats" INTEGER,
ADD COLUMN     "notifyOnAssignment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnMention" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "deletedAt",
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trialDays" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "billingInterval" SET DEFAULT 'monthly';

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3),
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "metadata",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "externalCustomerId" TEXT,
ADD COLUMN     "externalSubscriptionId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "approved",
DROP COLUMN "content",
DROP COLUMN "placeholders",
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "TemplateStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "variables" JSONB,
ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "language" SET DEFAULT 'en_US',
ALTER COLUMN "category" SET NOT NULL;

-- AlterTable
ALTER TABLE "Usage" ALTER COLUMN "count" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "processedById",
ADD COLUMN     "error" TEXT,
ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "nextRetryAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "WhatsAppAccount" DROP COLUMN "accountId",
ADD COLUMN     "messagingLimit" TEXT,
ADD COLUMN     "phoneNumberId" TEXT,
ADD COLUMN     "qualityRating" TEXT,
ADD COLUMN     "statusReason" TEXT,
ADD COLUMN     "wabaId" TEXT,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "logoUrl" TEXT,
ALTER COLUMN "timezone" SET NOT NULL,
ALTER COLUMN "timezone" SET DEFAULT 'UTC',
ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'USD';

-- CreateTable
CREATE TABLE "ContactGroup" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactGroupMember" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,

    CONSTRAINT "ContactGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationTag" (
    "conversationId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationTag_pkey" PRIMARY KEY ("conversationId","tagId")
);

-- CreateTable
CREATE TABLE "AssignmentRule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "strategy" "AssignmentStrategy" NOT NULL DEFAULT 'ROUND_ROBIN',
    "allowedRoles" "Role"[],
    "fallbackAgentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "membershipId" TEXT,

    CONSTRAINT "AssignmentRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignContact" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" "CampaignContactStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedVariables" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotSession" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "currentNodeKey" TEXT,
    "state" JSONB,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "handedOffAt" TIMESTAMP(3),
    "handoffReason" "ChatbotHandoffReason",
    "handoffAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "workspaceId" TEXT,
    "conversationId" TEXT,
    "campaignId" TEXT,
    "messageId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "secret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "events" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "httpStatus" INTEGER,
    "responseBody" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactGroup_workspaceId_idx" ON "ContactGroup"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactGroup_workspaceId_name_key" ON "ContactGroup"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "ContactGroupMember_groupId_idx" ON "ContactGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "ContactGroupMember_contactId_idx" ON "ContactGroupMember"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactGroupMember_contactId_groupId_key" ON "ContactGroupMember"("contactId", "groupId");

-- CreateIndex
CREATE INDEX "Tag_workspaceId_idx" ON "Tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_workspaceId_name_key" ON "Tag"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "ConversationTag_tagId_idx" ON "ConversationTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentRule_workspaceId_key" ON "AssignmentRule"("workspaceId");

-- CreateIndex
CREATE INDEX "CampaignContact_campaignId_status_idx" ON "CampaignContact"("campaignId", "status");

-- CreateIndex
CREATE INDEX "CampaignContact_contactId_idx" ON "CampaignContact"("contactId");

-- CreateIndex
CREATE INDEX "CampaignContact_status_failedAt_idx" ON "CampaignContact"("status", "failedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignContact_campaignId_contactId_key" ON "CampaignContact"("campaignId", "contactId");

-- CreateIndex
CREATE INDEX "ChatbotSession_conversationId_isActive_idx" ON "ChatbotSession"("conversationId", "isActive");

-- CreateIndex
CREATE INDEX "ChatbotSession_chatbotId_idx" ON "ChatbotSession"("chatbotId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_idx" ON "Notification"("workspaceId");

-- CreateIndex
CREATE INDEX "NotificationSetting_userId_workspaceId_idx" ON "NotificationSetting"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSetting_userId_workspaceId_type_channel_key" ON "NotificationSetting"("userId", "workspaceId", "type", "channel");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_workspaceId_isActive_idx" ON "WebhookEndpoint"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "WebhookDelivery_endpointId_status_idx" ON "WebhookDelivery"("endpointId", "status");

-- CreateIndex
CREATE INDEX "WebhookDelivery_status_nextRetryAt_idx" ON "WebhookDelivery"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_workspaceId_isActive_idx" ON "ApiKey"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "ApiKey_keyHash_idx" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "AuditLog_workspaceId_createdAt_idx" ON "AuditLog"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "ChatbotNode_botId_idx" ON "ChatbotNode"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotNode_botId_key_key" ON "ChatbotNode"("botId", "key");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_isOptOut_idx" ON "Contact"("workspaceId", "isOptOut");

-- CreateIndex
CREATE INDEX "Contact_workspaceId_lastSeenAt_idx" ON "Contact"("workspaceId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Conversation_workspaceId_status_idx" ON "Conversation"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Conversation_workspaceId_assigneeId_idx" ON "Conversation"("workspaceId", "assigneeId");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_chatbotId_isBotActive_idx" ON "Conversation"("chatbotId", "isBotActive");

-- CreateIndex
CREATE INDEX "Invite_workspaceId_status_idx" ON "Invite"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Invite_token_idx" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_email_idx" ON "Invite"("email");

-- CreateIndex
CREATE INDEX "Membership_workspaceId_isActive_idx" ON "Membership"("workspaceId", "isActive");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_workspaceId_type_idx" ON "Message"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "Plan_isPublic_isActive_idx" ON "Plan"("isPublic", "isActive");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Subscription_workspaceId_status_idx" ON "Subscription"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_externalSubscriptionId_idx" ON "Subscription"("externalSubscriptionId");

-- CreateIndex
CREATE INDEX "Template_workspaceId_status_idx" ON "Template"("workspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Template_workspaceId_name_language_key" ON "Template"("workspaceId", "name", "language");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_nextRetryAt_idx" ON "WebhookEvent"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "WhatsAppAccount_workspaceId_status_idx" ON "WhatsAppAccount"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Workspace_createdAt_idx" ON "Workspace"("createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactGroup" ADD CONSTRAINT "ContactGroup_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactGroupMember" ADD CONSTRAINT "ContactGroupMember_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactGroupMember" ADD CONSTRAINT "ContactGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ContactGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTag" ADD CONSTRAINT "ConversationTag_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationTag" ADD CONSTRAINT "ConversationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRule" ADD CONSTRAINT "AssignmentRule_fallbackAgentId_fkey" FOREIGN KEY ("fallbackAgentId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRule" ADD CONSTRAINT "AssignmentRule_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentRule" ADD CONSTRAINT "AssignmentRule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_audienceGroupId_fkey" FOREIGN KEY ("audienceGroupId") REFERENCES "ContactGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContact" ADD CONSTRAINT "CampaignContact_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignContact" ADD CONSTRAINT "CampaignContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotSession" ADD CONSTRAINT "ChatbotSession_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotSession" ADD CONSTRAINT "ChatbotSession_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSetting" ADD CONSTRAINT "NotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSetting" ADD CONSTRAINT "NotificationSetting_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
