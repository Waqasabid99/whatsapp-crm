import express from 'express'
import { prisma } from './db.js'
import { FeatureKey } from './generated/prisma/client.js'

const router = express.Router()

router.post('/seed-plans', async (req, res) => {
  try {
    console.log('🌱 Seeding plans & features...')

    // -----------------------
    // STARTER PLAN
    // -----------------------
    const starter = await prisma.plan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        slug: 'starter',
        name: 'Starter',
        description: 'For small teams getting started with WhatsApp automation',
        priceCents: 2900,
        currency: 'USD',
        billingInterval: 'monthly',
      },
    })

    await seedFeatures(starter.id, [
      [FeatureKey.MESSAGES_PER_MONTH, 1000],
      [FeatureKey.WHATSAPP_ACCOUNTS, 1],
      [FeatureKey.AI_CHATBOT, 0],
      [FeatureKey.AUTOMATION_LEVEL, 1],
      [FeatureKey.SUPPORT_LEVEL, 1],
      [FeatureKey.MESSAGE_TEMPLATES, 10],
      [FeatureKey.ANALYTICS_LEVEL, 1],
      [FeatureKey.CRM_INTEGRATIONS, 0],
      [FeatureKey.TEAM_MEMBERS, 1],
      [FeatureKey.CUSTOM_BRANDING, 0],
      [FeatureKey.API_ACCESS, 0],
    ])

    // -----------------------
    // PROFESSIONAL PLAN
    // -----------------------
    const professional = await prisma.plan.upsert({
      where: { slug: 'professional' },
      update: {},
      create: {
        slug: 'professional',
        name: 'Professional',
        description: 'For growing businesses using AI & automation',
        priceCents: 9900,
        currency: 'USD',
        billingInterval: 'monthly',
      },
    })

    await seedFeatures(professional.id, [
      [FeatureKey.MESSAGES_PER_MONTH, 10000],
      [FeatureKey.WHATSAPP_ACCOUNTS, 3],
      [FeatureKey.AI_CHATBOT, 1],
      [FeatureKey.AUTOMATION_LEVEL, 2],
      [FeatureKey.SUPPORT_LEVEL, 2],
      [FeatureKey.MESSAGE_TEMPLATES, null],
      [FeatureKey.ANALYTICS_LEVEL, 2],
      [FeatureKey.CRM_INTEGRATIONS, 1],
      [FeatureKey.TEAM_MEMBERS, 10],
      [FeatureKey.CUSTOM_BRANDING, 1],
      [FeatureKey.API_ACCESS, 0],
    ])

    // -----------------------
    // ENTERPRISE PLAN
    // -----------------------
    const enterprise = await prisma.plan.upsert({
      where: { slug: 'enterprise' },
      update: {},
      create: {
        slug: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations with full AI automation',
        priceCents: 29900,
        currency: 'USD',
        billingInterval: 'monthly',
        isPublic: false,
      },
    })

    await seedFeatures(enterprise.id, [
      [FeatureKey.MESSAGES_PER_MONTH, null],
      [FeatureKey.WHATSAPP_ACCOUNTS, null],
      [FeatureKey.AI_CHATBOT, 1],
      [FeatureKey.AUTOMATION_LEVEL, 3],
      [FeatureKey.SUPPORT_LEVEL, 3],
      [FeatureKey.MESSAGE_TEMPLATES, null],
      [FeatureKey.ANALYTICS_LEVEL, 2],
      [FeatureKey.CRM_INTEGRATIONS, 1],
      [FeatureKey.TEAM_MEMBERS, null],
      [FeatureKey.CUSTOM_BRANDING, 1],
      [FeatureKey.API_ACCESS, 1],
    ])

    return res.json({
      success: true,
      message: 'Plans & features seeded successfully',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      error: 'Something went wrong',
    })
  }
})

// -----------------------
// Helper function
// -----------------------
async function seedFeatures(
  planId: string,
  features: [FeatureKey, number | null][]
) {
  for (const [key, limitValue] of features) {
    await prisma.featureLimit.upsert({
      where: {
        planId_key: {
          planId,
          key,
        },
      },
      update: { limitValue },
      create: {
        planId,
        key,
        limitValue,
      },
    })
  }
}

export default router