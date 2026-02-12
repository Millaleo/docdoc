export const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'DocDoc Contigo API',
    version: '0.1.0',
    description: 'MVP API for families, staff workflows, and document management.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'Service is healthy' } } } },
    '/auth/login': { post: { summary: 'Authenticate and return access/refresh tokens' } },
    '/auth/refresh': { post: { summary: 'Rotate refresh token and issue new access token' } },
    '/family': { get: { summary: 'List authenticated user families' } },
    '/chat/conversations': { get: { summary: 'List conversations' }, post: { summary: 'Create conversation' } },
    '/tickets': { get: { summary: 'List tickets' }, post: { summary: 'Create ticket' } },
    '/documents/{familyId}': { get: { summary: 'List family documents' } },
  },
};
