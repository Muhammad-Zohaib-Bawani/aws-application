import { NextRequest, NextResponse } from 'next/server';
import '@/lib/db';
import { Profile } from '@/models/profile';
import { deleteImage } from '@/lib/s3';

export const runtime = 'nodejs';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const profile = await Profile.findByPk(params.id);
  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const profile = await Profile.findByPk(params.id);
  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const body = await req.json();
  const { name, email, bio, imageUrl } = body ?? {};

  // if image changed, delete the old S3 object
  if (imageUrl !== undefined && profile.imageUrl && profile.imageUrl !== imageUrl) {
    await deleteImage(profile.imageUrl);
  }

  try {
    await profile.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(bio !== undefined && { bio }),
      ...(imageUrl !== undefined && { imageUrl }),
    });
    return NextResponse.json(profile);
  } catch (err: any) {
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const profile = await Profile.findByPk(params.id);
  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (profile.imageUrl) await deleteImage(profile.imageUrl);
  await profile.destroy();
  return NextResponse.json({ ok: true });
}
