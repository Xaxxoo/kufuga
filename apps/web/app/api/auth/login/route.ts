import { NextResponse } from 'next/server';
const API_URL = process.env.API_URL ?? 'http://localhost:3000';
export async function POST(request: Request) {
  const response = await fetch(`${API_URL}/auth/admin/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(await request.json()) });
  const data = await response.json();
  if (!response.ok) return NextResponse.json(data, { status: response.status });
  const result = NextResponse.json({ user: data.user });
  result.cookies.set('kufuga_session', data.accessToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
  return result;
}
