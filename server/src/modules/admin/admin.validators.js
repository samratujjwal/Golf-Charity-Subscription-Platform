import { z } from 'zod';

export const paginationSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({}).optional().default({}),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    search: z.string().trim().max(120).optional(),
    status: z.string().trim().optional(),
    drawId: z.string().trim().optional(),
    featured: z.string().trim().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
  }),
});

export const updateUserScoresSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({
    scores: z.array(
      z.object({
        value: z.coerce.number().int().min(1).max(45),
        date: z.string().trim().min(1),
      }),
    ).max(5),
  }),
});

export const blockUserSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({
    isBlocked: z.boolean(),
  }),
});

export const roleSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({
    role: z.enum(['user', 'admin']),
  }),
});

export const subscriptionStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({
    status: z.enum(['active', 'expired', 'cancelled']),
  }),
});

export const drawActionSchema = z.object({
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  body: z.object({
    type: z.enum(['random', 'algorithm']).optional(),
    strategy: z.enum(['most_frequent', 'least_frequent']).optional(),
  }),
});

export const drawConfigSchema = z.object({
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  body: z.object({
    type: z.enum(['random', 'algorithm']),
  }),
});

export const drawIdSchema = z.object({
  params: z.object({
    drawId: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
});

export const charitySchema = z.object({
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(2000).optional().default(''),
    image: z.string().trim().optional().default(''),
    isFeatured: z.boolean().optional().default(false),
  }),
});

export const charityUpdateSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(2000).optional(),
    image: z.string().trim().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const winningIdSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1),
  }),
  query: z.object({}).optional().default({}),
  body: z.object({}).optional().default({}),
});
