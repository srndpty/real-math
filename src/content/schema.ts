import { z } from 'zod';
import {
  CONTENT_STATUSES,
  EDGE_RELATIONS,
  INDUSTRY_CATEGORIES,
  NODE_KINDS,
  UTILITY_PROFILES
} from './types';

const localeTextSchema = z.object({
  ja: z.string().min(1),
  en: z.string().min(1)
});

const relationSchema = z.object({
  targetId: z.string().min(1),
  relation: z.enum(EDGE_RELATIONS)
});

const referenceSchema = z.object({
  title: z.string().min(1),
  url: z.url().optional(),
  note: localeTextSchema.optional()
});

const nodeSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(NODE_KINDS),
    industryCategory: z.enum(INDUSTRY_CATEGORIES).optional(),
    labels: localeTextSchema,
    aliases: z.array(z.string()).default([]),
    shortSummary: localeTextSchema,
    friendlyExplanation: localeTextSchema,
    detailedExplanation: localeTextSchema,
    mathNotationLatex: z
      .object({
        inline: z.array(z.string()).optional(),
        block: z.array(z.string()).optional()
      })
      .optional(),
    keywords: z.array(localeTextSchema),
    relations: z.array(relationSchema).optional(),
    references: z.array(referenceSchema).default([]),
    tags: z.array(z.string()).default([]),
    difficultyLevel: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5)
    ]),
    utilityProfile: z.enum(UTILITY_PROFILES),
    certaintyLevel: z.enum(['high', 'medium', 'low']),
    status: z.enum(CONTENT_STATUSES)
  })
  .superRefine((node, ctx) => {
    if (node.kind === 'application' && !node.industryCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['industryCategory'],
        message: 'application nodes must have industryCategory'
      });
    }
  });

const edgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  relation: z.enum(EDGE_RELATIONS),
  note: localeTextSchema.optional()
});

export const graphContentSchema = z
  .object({
    version: z.string().min(1),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema)
  })
  .superRefine((content, ctx) => {
    const nodeIds = new Set(content.nodes.map((node) => node.id));
    const edgeIds = new Set<string>();

    for (const edge of content.edges) {
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges'],
          message: `Duplicate edge id: ${edge.id}`
        });
      }
      edgeIds.add(edge.id);

      if (!nodeIds.has(edge.source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges'],
          message: `Edge source not found: ${edge.source}`
        });
      }

      if (!nodeIds.has(edge.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['edges'],
          message: `Edge target not found: ${edge.target}`
        });
      }
    }

    for (const node of content.nodes) {
      if (node.relations) {
        for (const relation of node.relations) {
          if (!nodeIds.has(relation.targetId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['nodes'],
              message: `Relation target not found in node ${node.id}: ${relation.targetId}`
            });
          }
        }
      }
    }
  });

export type GraphContentInput = z.input<typeof graphContentSchema>;
export type GraphContentOutput = z.output<typeof graphContentSchema>;
