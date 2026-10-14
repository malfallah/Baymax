import { Router } from 'express';
import { z } from 'zod';
import { createAnswerSchema, createArticleSchema, createQuestionSchema } from '@baymax/shared';
import { notFound } from '../lib/errors';
import { assertId } from '../lib/ids';
import { toArticle, toQuestion } from '../lib/serialize';
import { validate } from '../lib/validate';
import { currentUserId, requireAuth, requireRole } from '../middleware/auth';
import { ArticleModel } from '../models/Article';
import { QuestionModel } from '../models/Question';

const AUTHOR_FIELDS = 'fullName avatarColor role';
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const listQuery = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.string().trim().max(40).optional(),
  tag: z.string().trim().max(40).optional(),
});

export const readMinutesFor = (text: string) =>
  Math.max(1, Math.round(text.split(/\s+/).length / 200));

/* eslint-disable @typescript-eslint/no-explicit-any -- populated lean docs are shaped by serializers */
async function loadQuestion(id: string) {
  const question = await QuestionModel.findById(id)
    .populate('author', AUTHOR_FIELDS)
    .populate('answers.author', AUTHOR_FIELDS)
    .lean<any>();
  if (!question) throw notFound('Question');
  return toQuestion(question);
}

export const communityRouter = Router();

communityRouter.get('/articles', async (req, res) => {
  const { q, category } = validate(listQuery, req.query);
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { summary: rx }];
  }
  const articles = await ArticleModel.find(filter)
    .sort({ publishedAt: -1 })
    .limit(100)
    .populate('author', AUTHOR_FIELDS)
    .lean<any[]>();
  res.json(articles.map(toArticle));
});

communityRouter.get('/articles/:id', async (req, res) => {
  const article = await ArticleModel.findById(assertId(req.params.id, 'Article'))
    .populate('author', AUTHOR_FIELDS)
    .lean<any>();
  if (!article) throw notFound('Article');
  res.json(toArticle(article));
});

communityRouter.post('/articles', requireAuth, requireRole('doctor'), async (req, res) => {
  const input = validate(createArticleSchema, req.body);
  const created = await ArticleModel.create({
    ...input,
    readMinutes: readMinutesFor(input.body),
    author: currentUserId(req),
  });
  const article = await ArticleModel.findById(created.id)
    .populate('author', AUTHOR_FIELDS)
    .lean<any>();
  res.status(201).json(toArticle(article));
});

communityRouter.get('/questions', async (req, res) => {
  const { q, tag } = validate(listQuery, req.query);
  const filter: Record<string, unknown> = {};
  if (tag) filter.tags = tag;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { body: rx }];
  }
  const questions = await QuestionModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('author', AUTHOR_FIELDS)
    .populate('answers.author', AUTHOR_FIELDS)
    .lean<any[]>();
  res.json(questions.map(toQuestion));
});

communityRouter.get('/questions/:id', async (req, res) => {
  res.json(await loadQuestion(assertId(req.params.id, 'Question')));
});

communityRouter.post('/questions', requireAuth, async (req, res) => {
  const input = validate(createQuestionSchema, req.body);
  const created = await QuestionModel.create({ ...input, author: currentUserId(req) });
  res.status(201).json(await loadQuestion(created.id));
});

communityRouter.post('/questions/:id/answers', requireAuth, async (req, res) => {
  const id = assertId(req.params.id, 'Question');
  const { body } = validate(createAnswerSchema, req.body);
  const updated = await QuestionModel.findByIdAndUpdate(id, {
    $push: { answers: { body, author: currentUserId(req) } },
  });
  if (!updated) throw notFound('Question');
  res.status(201).json(await loadQuestion(id));
});
