'use client';

import { useEffect, useState } from 'react';

type Profile = {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  imageUrl: string | null;
};

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await fetch('/api/profiles');
    if (res.ok) setProfiles(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let imageUrl: string | null = null;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (!up.ok) throw new Error(upJson.error || 'upload failed');
        imageUrl = upJson.url;
      }

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, bio, imageUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'failed to create profile');

      setName('');
      setEmail('');
      setBio('');
      setFile(null);
      (document.getElementById('file') as HTMLInputElement).value = '';
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="container">
      <h1>Profiles</h1>

      <form className="card" onSubmit={submit}>
        <label htmlFor="name">Name *</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />

        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="bio">Bio</label>
        <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />

        <label htmlFor="file">Profile image</label>
        <input
          id="file"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Add profile'}
        </button>
      </form>

      {profiles.length === 0 && <p className="muted">No profiles yet.</p>}
      {profiles.map((p) => (
        <div className="card profile" key={p.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrl || 'https://placehold.co/64'} alt={p.name} />
          <div className="meta">
            <strong>{p.name}</strong>
            <span>{p.email}</span>
            {p.bio && <p>{p.bio}</p>}
          </div>
          <button className="danger" onClick={() => remove(p.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
