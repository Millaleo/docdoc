-- Initial DocDoc Contigo MVP schema
CREATE TYPE "Role" AS ENUM ('USER_EXTERNAL', 'STAFF_OPERATOR', 'STAFF_CLINICAL', 'ADMIN_SYSTEM');
CREATE TYPE "FamilyStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "MemberType" AS ENUM ('ACTIVE', 'PASSIVE');
CREATE TYPE "TicketType" AS ENUM ('ADMIN', 'CLINICAL', 'PRESCRIPTION_REQUEST', 'LAB_ORDER_REQUEST', 'PROCEDURE', 'OTHER');
CREATE TYPE "TicketStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "DocCategory" AS ENUM ('EXAM', 'PRESCRIPTION', 'INSTRUCTIONS', 'CERTIFICATE', 'OTHER');
CREATE TYPE "ActorType" AS ENUM ('USER', 'STAFF', 'SYSTEM');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER_EXTERNAL',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL UNIQUE,
  "userAgent" TEXT,
  "ip" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE "Family" (
  "id" TEXT PRIMARY KEY,
  "holderUserId" TEXT NOT NULL,
  "planId" TEXT,
  "status" "FamilyStatus" NOT NULL DEFAULT 'ACTIVE',
  "maxMembers" INTEGER NOT NULL DEFAULT 5,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Family_holderUserId_fkey" FOREIGN KEY ("holderUserId") REFERENCES "User"("id")
);

CREATE TABLE "FamilyUser" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "canChat" BOOLEAN NOT NULL DEFAULT true,
  "canCreateTicket" BOOLEAN NOT NULL DEFAULT true,
  "canViewDocs" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FamilyUser_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE,
  CONSTRAINT "FamilyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "FamilyUser_familyId_userId_key" UNIQUE ("familyId", "userId")
);

CREATE TABLE "FamilyMember" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "userId" TEXT,
  "displayName" TEXT NOT NULL,
  "type" "MemberType" NOT NULL DEFAULT 'ACTIVE',
  "age" INTEGER,
  "birthYear" INTEGER,
  "sex" TEXT,
  "keyNotes" TEXT,
  "emergencyContact" TEXT,
  CONSTRAINT "FamilyMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE
);

CREATE TABLE "FamilyInvite" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "invitedEmail" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  CONSTRAINT "FamilyInvite_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE
);

CREATE TABLE "Plan" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT);
CREATE TABLE "PlanBenefit" (
  "id" TEXT PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT NOT NULL,
  CONSTRAINT "PlanBenefit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE
);
CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL UNIQUE,
  "planId" TEXT NOT NULL,
  "renewalDate" TIMESTAMP(3) NOT NULL,
  "status" "FamilyStatus" NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "Subscription_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE,
  CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id")
);
CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reference" TEXT,
  CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE
);

CREATE TABLE "Conversation" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memberId" TEXT,
  "subject" TEXT,
  "assignedStaffId" TEXT,
  "tag" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Conversation_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE,
  CONSTRAINT "Conversation_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id")
);
CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "senderUserId" TEXT NOT NULL,
  "text" TEXT,
  "attachmentPath" TEXT,
  "attachmentMime" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE
);

CREATE TABLE "Ticket" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memberId" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "type" "TicketType" NOT NULL,
  "status" "TicketStatus" NOT NULL DEFAULT 'RECEIVED',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "assignedToId" TEXT,
  "resolutionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ticket_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE,
  CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id")
);
CREATE TABLE "TicketEvent" (
  "id" TEXT PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE
);

CREATE TABLE "Document" (
  "id" TEXT PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memberId" TEXT,
  "category" "DocCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "mimeType" TEXT,
  "uploadedById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Document_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "actorType" "ActorType" NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "ip" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
