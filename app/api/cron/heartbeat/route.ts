import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', message: 'Heartbeat successful' });
  } catch (error) {
    console.error('Database heartbeat failed:', error);
    return NextResponse.json({ status: 'error', message: 'Heartbeat failed' }, { status: 500 });
  }
}
