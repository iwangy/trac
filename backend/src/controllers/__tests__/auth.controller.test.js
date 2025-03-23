const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/user.model');
const { generateToken } = require('../../utils/auth');

describe('Auth Controller', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/trc-attendance-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('name', 'Test Student');
      expect(response.body.user).toHaveProperty('role', 'student');
    });

    it('should not register a user with existing email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'student',
      });

      const response = await request(app).post('/api/auth/register').send({
        name: 'New User',
        email: 'existing@test.com',
        password: 'password123',
        role: 'student',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: '$2a$10$YaB6xpBcmS6YwZKz9.VNk.1mpN9E6GZjUZxNE4Uz5z9qZwjwS1v8e', // password123
        role: 'student',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@test.com');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'Profile User',
        email: 'profile@test.com',
        password: 'password123',
        role: 'student',
      });
      token = generateToken(user);
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Profile User');
      expect(response.body).toHaveProperty('email', 'profile@test.com');
    });

    it('should not get profile without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
    });
  });
});
