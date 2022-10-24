import * as chai from 'chai';
import * as request from 'supertest';
import chaiHttp = require('chai-http');
import { server } from '../appTest';
import { insertUser, clearDb } from '../helpers';



chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should();


describe('User tests', () => {
    beforeEach(async () => {
       await insertUser({})
    })
   afterEach(async () => {
     await clearDb();
   })

    describe('Register tests', () => {
        it('should register a user /users/register', async () => {
            const response = await request(server.server!)
            .post(`/users/register`)
            .send({
                first_name: 'Kosy',
                last_name: 'Allison',
                email: 'kosy@mymail.com',
                password: 'Lagos',
                phone: '+2348146392214' 
            })
            expect(response.status).to.be.eq(201);
            expect(response.body).to.include.keys([
                'data',
                'message'
            ])

            expect(response.body.data).to.include({
                first_name: 'Kosy',
                last_name: 'Allison',
                email: 'kosy@mymail.com',
                phone: '+2348146392214'
            })
        })

        it('should not register a user /users/register (duplicate email)', async () => {
            const response = await request(server.server!)
            .post(`/users/register`)
            .send({
                first_name: 'Kosy',
                last_name: 'Allison',
                email: 'allisonkosy@gmail.com',
                password: 'Lagos',
                phone: '+2348146392214',
            })
            expect(response.status).to.be.eq(400);
            
            expect(response.body).to.include.keys([
                'message',
                'data'
            ])
            expect(response.body.message).to.eql('user already exitsts');

       
        })

        it('should not register a user /users/register  (incomplete)', async () => {
            const response = await request(server.server!)
            .post(`/users/register`)
            .send({
                first_name: 'Kosy',
                last_name: 'Allison',
                email: 'kosy@mymail.com',
                password: 'Lagos',

            })
            expect(response.status).to.be.eq(400);
            expect(response.body).to.include.keys([
                'message',
                'data',
            ])

            expect(response.body.message).to.eql('Invalid parameters');
       
        })
    })


    describe('Login Tests', () => {
        it('should login a user',async () => {
            const response = await request(server.server!)
            .post(`/users/login`)
            .send({
                password: 'temp_password',
                email: 'allisonkosy@gmail.com',
            })
            expect(response.status).to.be.eq(200);
            expect(response.body).to.include.keys([
                'data',
                'message'
            ])

            should.exist(response.body.data.token);

            expect(response.body.data.user).to.include({
                first_name: 'Kosy',
                last_name: 'Allison',
                email: 'allisonkosy@gmail.com',
                phone: '+2348146392214'
            })  
        })

        it('should not login a user',async () => {
            const response = await request(server.server!)
            .post(`/users/login`)
            .send({
                password: 'temp_passwordhh',
                email: 'allisonkosy@gmail.com',
            })
            expect(response.status).to.be.eq(400);
            expect(response.body).to.include.keys([
                'error',
                'message'
            ])

            expect(response.body.message).to.be.eq('password or email incorrect')
        })
    })
});
