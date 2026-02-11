export const openApiDocument = {
  openapi: '3.0.0',
  info: { title: 'DocDoc Contigo API', version: '0.1.0' },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/health': { get: { summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/auth/register': { post: { summary: 'Register user' } },
    '/auth/login': { post: { summary: 'Login' } },
    '/auth/refresh': { post: { summary: 'Refresh token' } },
    '/family/create': { post: { summary: 'Create family' } },
    '/chat/conversations': { get: { summary: 'List conversations' }, post: { summary: 'Create conversation' } },
    '/tickets': { get: { summary: 'List tickets' }, post: { summary: 'Create ticket' } },
    '/documents/{familyId}': { get: { summary: 'List documents for family' } }
  }
};
