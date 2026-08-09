import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../../app';
import { createTestUserAndLogin } from '../../../tests/test-utils';
import { prismaTest } from '../../../tests/setup';

describe('Trainers Module Integration', () => {
  describe('GET /trainers/me', () => {
    it('should return the TrainerSave for the authenticated user', async () => {
      const { accessToken, user } = await createTestUserAndLogin('trainer1', 'pass123', 't1@t.com');
      
      const res = await request(app)
        .get('/trainers/me')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(user.id);
      expect(res.body.data.starterChosenAt).toBeNull();
      expect(res.body.data.party).toBeInstanceOf(Array);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/trainers/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /trainers/starter', () => {
    it('should return 400 if starter species is invalid (validation)', async () => {
      const { accessToken } = await createTestUserAndLogin('trainer2', 'pass123', 't2@t.com');
      
      const res = await request(app)
        .post('/trainers/starter')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ speciesId: 99999 }); // Invalid species id
      
      // Depending on implementation, it could be 400 validation or 404 not found
      // Assuming it's at least not 500
      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('should return an error if a starter was already chosen', async () => {
      const { accessToken, user } = await createTestUserAndLogin('trainer3', 'pass123', 't3@t.com');
      
      // Initialize TrainerSave by fetching profile
      await request(app).get('/trainers/me').set('Authorization', `Bearer ${accessToken}`);

      // Manually set starterChosenAt to simulate already chosen
      await prismaTest.trainerSave.update({
        where: { userId: user.id },
        data: { starterChosenAt: new Date() }
      });

      const res = await request(app)
        .post('/trainers/starter')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ speciesId: 1 }); // Bulbasaur
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('already chosen');
    });
  });

  describe('PATCH /trainers/party/:pokemonId/moves', () => {
    it('should return 404 if the pokemon is not found in party', async () => {
      const { accessToken } = await createTestUserAndLogin('trainer4', 'pass123', 't4@t.com');
      
      const res = await request(app)
        .patch('/trainers/party/nonexistent-id/moves')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ moves: [1, 2, 3, 4] });
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
