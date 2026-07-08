import { NextRequest, NextResponse } from 'next/server';
import '@/lib/db'; // ensure models are initialized
import { Profile } from '@/models/profile';

export const runtime = 'nodejs';

export async function GET() {
  const profiles = await Profile.findAll({ order: [['createdAt', 'DESC']] });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, bio, imageUrl } = body ?? {};

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }

  try {
    const profile = await Profile.create({
      name,
      email,
      bio: bio ?? null,
      imageUrl: imageUrl ?? null,
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (err: any) {
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to create profile' }, { status: 500 });
  }
}
