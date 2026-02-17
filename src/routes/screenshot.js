import { screenshotSchema } from '../utils/validation.js';
import { renderScreenshot } from '../services/renderer.js';
import { formatError, ErrorCodes } from '../utils/errors.js';

export default async function screenshotRoutes(fastify) {
  fastify.post('/v1/screenshot', async (request, reply) => {
    // Validate input
    const result = screenshotSchema.safeParse(request.body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return reply.status(400).send(
        formatError(ErrorCodes.INVALID_REQUEST, firstError.message)
      );
    }

    try {
      const imageBuffer = await renderScreenshot(result.data);
      const contentType = result.data.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const extension = result.data.format === 'jpeg' ? 'jpg' : 'png';

      reply
        .header('Content-Type', contentType)
        .header('Content-Disposition', `inline; filename="screenshot.${extension}"`)
        .send(imageBuffer);
    } catch (err) {
      request.log.error(err, 'Screenshot rendering failed');
      return reply.status(500).send(
        formatError(
          ErrorCodes.RENDERING_FAILED,
          'Failed to capture screenshot. Please check your URL or HTML and try again.'
        )
      );
    }
  });
}
