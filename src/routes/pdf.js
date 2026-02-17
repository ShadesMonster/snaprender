import { pdfSchema } from '../utils/validation.js';
import { renderPdf } from '../services/renderer.js';
import { formatError, ErrorCodes } from '../utils/errors.js';

export default async function pdfRoutes(fastify) {
  fastify.post('/v1/pdf', async (request, reply) => {
    // Validate input
    const result = pdfSchema.safeParse(request.body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return reply.status(400).send(
        formatError(ErrorCodes.INVALID_REQUEST, firstError.message)
      );
    }

    try {
      const pdfBuffer = await renderPdf(result.data);

      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', 'inline; filename="document.pdf"')
        .send(pdfBuffer);
    } catch (err) {
      request.log.error(err, 'PDF rendering failed');
      return reply.status(500).send(
        formatError(ErrorCodes.RENDERING_FAILED, 'Failed to render PDF. Please check your HTML and try again.')
      );
    }
  });
}
