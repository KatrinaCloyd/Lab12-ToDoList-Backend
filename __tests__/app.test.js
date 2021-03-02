require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });


    test('returns new item added by user', async () => {
      const newItem = {
        todo: 'give dog a bath',
        importance: 'medium',
        completed: false,
      };

      const dbItem = {
        ...newItem,
        user_id: 2,
        id: 5
      };

      const data = await fakeRequest(app)
        .post('/api/items')
        .send(newItem)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbItem);
    });

    test('returns single updated item', async () => {
      const updatedItem = {
        todo: 'give dog a bath',
        importance: 'high',
        completed: false,
      };

      const dbUpdatedItem = {
        ...updatedItem,
        user_id: 2,
        id: 5
      };

      const data = await fakeRequest(app)
        .put('/api/items/5')
        .send(updatedItem)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(dbUpdatedItem);
    });

    test('returns all items for user', async () => {
      const allItems = [{
        todo: 'give dog a bath',
        importance: 'high',
        completed: false,
        user_id: 2,
        id: 5
      }];

      const data = await fakeRequest(app)
        .get('/api/items')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(allItems);
    });


  });
});
