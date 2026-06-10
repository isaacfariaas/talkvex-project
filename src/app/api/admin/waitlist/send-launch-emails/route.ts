/**
 * Admin API: Send Waitlist Launch Emails
 *
 * POST /api/admin/waitlist/send-launch-emails
 *
 * Triggers the launch email campaign for all waitlist members who haven't received it yet.
 * Includes Early Adopter bonus codes.
 *
 * Security: This endpoint should be protected with admin authentication in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmailBatch } from '@/lib/email-service';
import { waitlistLaunchEmail } from '@/lib/email-templates';

export async function POST(req: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const launchDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const waitlistMembers = await prisma.waitlist.findMany({
      where: {
        launchEmailSent: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        earlyAdopterCode: true,
      },
    });

    if (waitlistMembers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No waitlist members pending launch email',
        total: 0,
        sent: 0,
      });
    }

    const emails = waitlistMembers.map((member) => ({
      to: member.email,
      template: waitlistLaunchEmail({
        name: member.name,
        email: member.email,
        earlyAdopterCode: member.earlyAdopterCode,
        launchDate,
      }),
    }));

    const result = await sendEmailBatch(emails, {
      batchSize: 10,
      delayMs: 1000,
    });

    const successfulMemberIds = waitlistMembers
      .filter((member, index) => result.results[index]?.success)
      .map((member) => member.id);

    await prisma.waitlist.updateMany({
      where: {
        id: { in: successfulMemberIds },
      },
      data: {
        launchEmailSent: true,
        launchEmailSentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sent ${result.success} launch emails to waitlist members`,
      total: result.total,
      sent: result.success,
      failed: result.failed,
      results: result.results,
    });
  } catch (error) {
    console.error('Error sending waitlist launch emails:', error);
    return NextResponse.json(
      {
        error: 'Failed to send launch emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // TODO: Add admin authentication check

    const stats = await prisma.waitlist.aggregate({
      _count: {
        _all: true,
      },
      where: {
        launchEmailSent: false,
      },
    });

    const total = await prisma.waitlist.count();
    const sent = await prisma.waitlist.count({
      where: {
        launchEmailSent: true,
      },
    });

    return NextResponse.json({
      total,
      pending: stats._count._all,
      sent,
    });
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch waitlist stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
