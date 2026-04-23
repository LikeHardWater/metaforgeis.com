"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { auditLog } from "@/src/lib/audit";
import { LeadSource, LeadStatus, AccountType, DealStatus, ActivityType, TaskPriority, TaskType } from "@prisma/client";

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function createLead(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const lead = await prisma.crmLead.create({
    data: {
      firstName: formData.get("firstName") as string,
      lastName:  formData.get("lastName") as string,
      email:     (formData.get("email") as string) || null,
      phone:     (formData.get("phone") as string) || null,
      company:   (formData.get("company") as string) || null,
      title:     (formData.get("title") as string) || null,
      source:    (formData.get("source") as LeadSource) || LeadSource.OTHER,
      status:    LeadStatus.NEW,
      notes:     (formData.get("notes") as string) || null,
      ownerId:   session.user.id,
    },
  });

  await auditLog({ action: "LEAD_CREATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmLead", entityId: lead.id });
  redirect(`/app/crm/leads/${lead.id}`);
}

export async function updateLead(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const before = await prisma.crmLead.findUnique({ where: { id } });

  const lead = await prisma.crmLead.update({
    where: { id },
    data: {
      firstName: formData.get("firstName") as string,
      lastName:  formData.get("lastName") as string,
      email:     (formData.get("email") as string) || null,
      phone:     (formData.get("phone") as string) || null,
      company:   (formData.get("company") as string) || null,
      title:     (formData.get("title") as string) || null,
      source:    formData.get("source") as LeadSource,
      status:    formData.get("status") as LeadStatus,
      score:     parseInt(formData.get("score") as string) || 0,
      notes:     (formData.get("notes") as string) || null,
    },
  });

  await auditLog({ action: "LEAD_UPDATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmLead", entityId: id, before, after: lead });
  redirect(`/app/crm/leads/${id}?notify=saved`);
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function createContact(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const contact = await prisma.crmContact.create({
    data: {
      firstName:  formData.get("firstName") as string,
      lastName:   formData.get("lastName") as string,
      email:      (formData.get("email") as string) || null,
      phone:      (formData.get("phone") as string) || null,
      mobile:     (formData.get("mobile") as string) || null,
      title:      (formData.get("title") as string) || null,
      department: (formData.get("department") as string) || null,
      accountId:  (formData.get("accountId") as string) || null,
      notes:      (formData.get("notes") as string) || null,
      ownerId:    session.user.id,
    },
  });

  await auditLog({ action: "CONTACT_CREATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmContact", entityId: contact.id });
  redirect(`/app/crm/contacts/${contact.id}`);
}

export async function updateContact(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const before = await prisma.crmContact.findUnique({ where: { id } });

  const contact = await prisma.crmContact.update({
    where: { id },
    data: {
      firstName:  formData.get("firstName") as string,
      lastName:   formData.get("lastName") as string,
      email:      (formData.get("email") as string) || null,
      phone:      (formData.get("phone") as string) || null,
      mobile:     (formData.get("mobile") as string) || null,
      title:      (formData.get("title") as string) || null,
      department: (formData.get("department") as string) || null,
      accountId:  (formData.get("accountId") as string) || null,
      notes:      (formData.get("notes") as string) || null,
    },
  });

  await auditLog({ action: "CONTACT_UPDATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmContact", entityId: id, before, after: contact });
  redirect(`/app/crm/contacts/${id}?notify=saved`);
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function createAccount(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const account = await prisma.crmAccount.create({
    data: {
      name:         formData.get("name") as string,
      type:         (formData.get("type") as AccountType) || AccountType.PROSPECT,
      industry:     (formData.get("industry") as string) || null,
      website:      (formData.get("website") as string) || null,
      phone:        (formData.get("phone") as string) || null,
      email:        (formData.get("email") as string) || null,
      addressLine1: (formData.get("addressLine1") as string) || null,
      city:         (formData.get("city") as string) || null,
      state:        (formData.get("state") as string) || null,
      zip:          (formData.get("zip") as string) || null,
      notes:        (formData.get("notes") as string) || null,
      ownerId:      session.user.id,
    },
  });

  await auditLog({ action: "ACCOUNT_CREATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmAccount", entityId: account.id });
  redirect(`/app/crm/accounts/${account.id}`);
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function createDeal(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const pipeline = await prisma.pipeline.findFirst({
    where: { isDefault: true },
    include: { stages: { orderBy: { order: "asc" }, take: 1 } },
  });
  if (!pipeline || !pipeline.stages[0]) throw new Error("No default pipeline found");

  const stageId = (formData.get("stageId") as string) || pipeline.stages[0].id;

  const deal = await prisma.crmDeal.create({
    data: {
      name:              formData.get("name") as string,
      value:             formData.get("value") ? parseFloat(formData.get("value") as string) : null,
      probability:       formData.get("probability") ? parseInt(formData.get("probability") as string) : null,
      expectedCloseDate: formData.get("expectedCloseDate") ? new Date(formData.get("expectedCloseDate") as string) : null,
      status:            DealStatus.OPEN,
      notes:             (formData.get("notes") as string) || null,
      pipelineId:        pipeline.id,
      stageId,
      accountId:         (formData.get("accountId") as string) || null,
      contactId:         (formData.get("contactId") as string) || null,
      ownerId:           session.user.id,
    },
  });

  await auditLog({ action: "DEAL_CREATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmDeal", entityId: deal.id });
  redirect(`/app/crm/deals/${deal.id}`);
}

export async function updateDeal(id: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const before = await prisma.crmDeal.findUnique({ where: { id } });

  const deal = await prisma.crmDeal.update({
    where: { id },
    data: {
      name:              formData.get("name") as string,
      value:             formData.get("value") ? parseFloat(formData.get("value") as string) : null,
      probability:       formData.get("probability") ? parseInt(formData.get("probability") as string) : null,
      expectedCloseDate: formData.get("expectedCloseDate") ? new Date(formData.get("expectedCloseDate") as string) : null,
      status:            formData.get("status") as DealStatus,
      stageId:           formData.get("stageId") as string,
      accountId:         (formData.get("accountId") as string) || null,
      contactId:         (formData.get("contactId") as string) || null,
      notes:             (formData.get("notes") as string) || null,
    },
  });

  await auditLog({ action: "DEAL_UPDATED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmDeal", entityId: id, before, after: deal });
  redirect(`/app/crm/deals/${id}?notify=saved`);
}

export async function convertLeadToOpportunity(leadId: string, formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  const lead = await prisma.crmLead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const pipeline = await prisma.pipeline.findFirst({
    where: { isDefault: true },
    include: { stages: { orderBy: { order: "asc" }, take: 1 } },
  });
  if (!pipeline || !pipeline.stages[0]) throw new Error("No default pipeline found");

  const dealName = (formData.get("dealName") as string) || `${lead.firstName} ${lead.lastName}${lead.company ? ` – ${lead.company}` : ""}`;

  const deal = await prisma.crmDeal.create({
    data: {
      name:      dealName,
      value:     formData.get("value") ? parseFloat(formData.get("value") as string) : null,
      status:    DealStatus.OPEN,
      pipelineId: pipeline.id,
      stageId:   pipeline.stages[0].id,
      notes:     lead.notes,
      ownerId:   session.user.id,
    },
  });

  await prisma.crmLead.update({
    where: { id: leadId },
    data: { convertedAt: new Date(), status: LeadStatus.CONVERTED },
  });

  await auditLog({ action: "LEAD_CONVERTED", userId: session.user.id, userEmail: session.user.email, userRole: session.user.role, entity: "CrmLead", entityId: leadId, after: { dealId: deal.id } });
  redirect(`/app/crm/deals/${deal.id}?notify=converted`);
}

// ─── Activities ───────────────────────────────────────────────────────────────

export async function addActivity(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  await prisma.crmActivity.create({
    data: {
      type:      formData.get("type") as ActivityType,
      content:   formData.get("content") as string,
      userId:    session.user.id,
      accountId: (formData.get("accountId") as string) || null,
      contactId: (formData.get("contactId") as string) || null,
      leadId:    (formData.get("leadId") as string) || null,
      dealId:    (formData.get("dealId") as string) || null,
    },
  });

  const entityType = formData.get("entityType") as string;
  const entityId = formData.get("entityId") as string;
  revalidatePath(`/app/crm/${entityType}/${entityId}`);
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthenticated");

  await prisma.crmTask.create({
    data: {
      title:         formData.get("title") as string,
      description:   (formData.get("description") as string) || null,
      dueDate:       formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      priority:      (formData.get("priority") as TaskPriority) || TaskPriority.MEDIUM,
      type:          (formData.get("type") as TaskType) || TaskType.FOLLOW_UP,
      relatedToType: (formData.get("relatedToType") as string) || null,
      relatedToId:   (formData.get("relatedToId") as string) || null,
      ownerId:       session.user.id,
    },
  });

  const entityType = formData.get("relatedToType") as string;
  const entityId = formData.get("relatedToId") as string;
  if (entityType && entityId) revalidatePath(`/app/crm/${entityType}/${entityId}`);
}
