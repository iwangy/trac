const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TRC Attendance API Documentation',
      version: '1.0.0',
      description: 'API documentation for the TRC Attendance System',
      contact: {
        name: 'TRC Support',
        email: '',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints related to user authentication',
      },
      {
        name: 'Admin',
        description: 'Endpoints related to admins',
      },
      {
        name: 'Attendance',
        description: 'Endpoints related to attendance',
      },
      {
        name: 'Meetings',
        description: 'Endpoints related to meetings',
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
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['student', 'mentor', 'admin'],
              description: 'User role',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;
