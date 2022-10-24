import * as chai from 'chai';
import * as request from 'supertest';
import chaiHttp = require('chai-http');
import { server } from '../appTest';
import { insertUser, clearDb, createWebToken } from '../helpers';
import { User } from '../../src/database/models';



chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should();
let token: string;
let user: User;

describe('User tests', () => {
    beforeEach(async () => {
       let newUser = await insertUser({email: 'kosy@random.com'})
       user = newUser!;
       token = await createWebToken({email: user!.email, user_id: user!.user_id})
    })
   afterEach(async () => {
     await clearDb();
   })

    describe('Bank acccount tests', () => {
        it('should create a bank account /bank-accounts/create', async () => {
            should.exist(token)
            should.exist(user);
            const response = await request(server.server!)
            .post(`/bank-accounts/create`)
            .send({
              user_id: user.user_id
            })
            .auth(token, { type: 'bearer' });
            expect(response.status).to.be.eq(201);
            expect(response.body).to.include.keys([
                'message',
                'data'
            ])
            expect(response.body.data).to.include({
                user_id: user.user_id,
                bank_account_name: "Raven/Kosy - " + `${user.first_name} ${user.last_name}`,
                bank_name: "Wema Bank",
                bank_balance: 0,
            })
        })      
    })


  
});
