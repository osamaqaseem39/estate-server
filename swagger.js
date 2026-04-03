const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GT Estate API',
      version: '1.0.0',
      description: 'Backend API for GT Estates — property listings, gallery, and career applications.',
      contact: {
        name: 'GT Estates',
      },
    },
    servers: [
      {
        url: 'https://estate-server-nine.vercel.app',
        description: 'Production (Vercel)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
