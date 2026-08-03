import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
const API_URL = process.env.API_URL ?? 'http://localhost:3000';
type Context = { params: Promise<{ path: string[] }> };
async function proxy(request: Request, context: Context) {
  const { path } = await context.params; const token = (await cookies()).get('kufuga_session')?.value; const url = `${API_URL}/${path.join('/')}${new URL(request.url).search}`;
  const headers = new Headers({ Accept: 'application/json' }); if (token) headers.set('Authorization', `Bearer ${token}`); if (request.method !== 'GET') headers.set('Content-Type', 'application/json');
  const response = await fetch(url, { method: request.method, headers, body: request.method === 'GET' ? undefined : await request.text(), cache: 'no-store' });
  return new NextResponse(await response.text(), { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' } });
}
export const GET = proxy; export const POST = proxy; export const PATCH = proxy;
