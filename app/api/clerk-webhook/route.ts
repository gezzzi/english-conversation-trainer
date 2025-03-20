import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new NextResponse('Webhook secret is not set', { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // When a user is created, initialize their progress in Supabase
    const { id } = evt.data;
    
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: id,
        total_messages: 0,
        correct_sentences: 0,
        vocabulary_learned: 0,
        last_practiced: new Date().toISOString(),
        streak: 0,
        level: 1,
        experience: 0,
      });
    
    if (error) {
      console.error('Error initializing user progress:', error);
      return new NextResponse('Error initializing user progress', { status: 500 });
    }
  }

  return new NextResponse('Webhook received', { status: 200 });
} 