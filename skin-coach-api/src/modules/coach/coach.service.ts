import { Injectable } from '@nestjs/common';

import { GeminiService } from '../../ai/gemini.service';
import { PrismaService } from '../../database/prisma.service';
import { PromptService } from '../../prompts/prompt.service';
import { UsersService } from '../users/users.service';
import { coachReplyGeminiSchema, coachReplyZod } from './coach.schema';

export interface CoachTodayResponse {
  hasInsight: boolean;
  latestScore?: number | null;
  insight?: {
    summary: string;
    recommendation: string;
    positiveChanges: string | null;
    attentionNeeded: string | null;
    nextSteps: string | null;
  };
}

export interface CoachChatResponse {
  reply: string;
  followUpQuestions: string[];
  disclaimer: string;
}

export interface CoachMessage {
  role: string;
  message: string;
  createdAt: Date;
}

@Injectable()
export class CoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly prompts: PromptService,
    private readonly users: UsersService,
  ) {}

  // docs/05 Today's Insights — surfaces the latest completed scan's coaching insight.
  async getToday(clerkId: string): Promise<CoachTodayResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const scan = await this.prisma.skinScan.findFirst({
      where: { userId, status: 'completed', deletedAt: null },
      orderBy: { scanDate: 'desc' },
      include: { analysis: { select: { overallScore: true } }, insight: true },
    });
    if (!scan?.insight) {
      return { hasInsight: false };
    }
    return {
      hasInsight: true,
      latestScore: scan.analysis?.overallScore ?? null,
      insight: {
        summary: scan.insight.summary,
        recommendation: scan.insight.recommendation,
        positiveChanges: scan.insight.positiveChanges,
        attentionNeeded: scan.insight.attentionNeeded,
        nextSteps: scan.insight.nextSteps,
      },
    };
  }

  // docs/05 Ask AI + docs/07 Prompt 4: personalized to the user's real data, never
  // diagnoses/prescribes. Both turns are persisted to the user's conversation.
  async chat(clerkId: string, message: string): Promise<CoachChatResponse> {
    const userId = await this.users.getLocalUserId(clerkId);
    const [context, conversation] = await Promise.all([
      this.buildContext(userId),
      this.getOrCreateConversation(userId),
    ]);

    const result = await this.gemini.generateJson({
      systemInstruction: this.prompts.get('coach'),
      parts: [{ text: `Context:\n${context}\n\nUser question: ${message}` }],
      responseSchema: coachReplyGeminiSchema,
      validate: (raw) => coachReplyZod.parse(raw),
    });
    const reply = result.value;

    await this.prisma.aiMessage.createMany({
      data: [
        { conversationId: conversation.id, role: 'user', message },
        {
          conversationId: conversation.id,
          role: 'assistant',
          message: reply.answer,
        },
      ],
    });
    await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      reply: reply.answer,
      followUpQuestions: reply.followUpQuestions,
      disclaimer: reply.disclaimer,
    };
  }

  async getHistory(clerkId: string): Promise<CoachMessage[]> {
    const userId = await this.users.getLocalUserId(clerkId);
    const conversation = await this.prisma.aiConversation.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
    if (!conversation) {
      return [];
    }
    const messages = await this.prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((m) => ({
      role: m.role,
      message: m.message,
      createdAt: m.createdAt,
    }));
  }

  private async getOrCreateConversation(
    userId: string,
  ): Promise<{ id: string }> {
    const existing = await this.prisma.aiConversation.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.aiConversation.create({
      data: { userId, title: 'SkinCoach' },
      select: { id: true },
    });
  }

  private async buildContext(userId: string): Promise<string> {
    const [scan, user] = await Promise.all([
      this.prisma.skinScan.findFirst({
        where: { userId, status: 'completed', deletedAt: null },
        orderBy: { scanDate: 'desc' },
        include: { analysis: true, insight: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      }),
    ]);

    const parts: string[] = [];
    const p = user?.profile;
    if (p) {
      parts.push(
        `Skin profile: age ${p.age ?? 'unknown'}, skin type ${p.skinType ?? 'unknown'}, primary goal ${p.primaryGoal ?? 'general skin health'}.`,
      );
    }
    if (scan?.analysis) {
      const a = scan.analysis;
      parts.push(
        `Latest scan overall score ${a.overallScore}. Metrics: acne ${a.acneScore}, hydration ${a.hydrationScore}, redness ${a.rednessScore}, pigmentation ${a.pigmentationScore}, texture ${a.textureScore}, oiliness ${a.oilinessScore}, pores ${a.poresScore}, wrinkles ${a.wrinkleScore}, darkCircles ${a.darkCircleScore}.`,
      );
    }
    if (scan?.insight) {
      parts.push(`Latest coaching summary: ${scan.insight.summary}`);
    }
    if (parts.length === 0) {
      parts.push('The user has not completed a skin scan yet.');
    }
    return parts.join('\n');
  }
}
