// app/api/clerk-webhook/route.ts
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'

// Define the expected structure of the user data
interface UserWebhookEvent {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
    }>;
    first_name: string | null;
    image_url: string | null;
  };
  object: string;
  type: string;
}

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
    }

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Error occured -- no svix headers', {
        status: 400
      })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);
    
    let evt: UserWebhookEvent
    
    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as UserWebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error occurred', {
        status: 400
      })
    }

    const { id, email_addresses, first_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await db.user.upsert({
      where: { clerkId: id },
      update: {
        email,
        name: first_name ?? '',
        profileImage: image_url ?? '',
      },
      create: {
        clerkId: id,
        email,
        name: first_name ?? '',
        profileImage: image_url ?? '',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User updated in database successfully'
    })
    
  } catch (error) {
    console.error('Error in webhook:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Optionally, if you need to handle OPTIONS requests
export async function OPTIONS() {
  return new NextResponse('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  })
}