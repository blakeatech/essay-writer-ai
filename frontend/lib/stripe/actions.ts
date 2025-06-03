'use server'

import { stripe } from '../stripe'
import { headers } from 'next/headers'

export async function createCheckoutSession(quantity: number, userId: string) {
  const headersList = await headers();
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const host = headersList.get('host')
  const origin = `${protocol}://${host}`

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        user_id: userId,
        credit_amount: quantity
      }
    })

    return Response.redirect(session.url!)
  } catch (err) {
    return Response.redirect(`${origin}/?error=true`)
  }
} 