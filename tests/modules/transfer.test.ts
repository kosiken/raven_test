import * as chai from "chai";
import * as request from "supertest";
import chaiHttp = require("chai-http");
import { server } from "../appTest";
import { User, BankAccount, Transaction } from "../../src/database/models";
import {
  insertUser,
  clearDb,
  createWebToken,
  createBankAccont,
  createTransactions,
  transferWebHookMock,
  collectionWebhook,
  delay,
} from "../helpers";

chai.use(chaiHttp);
const expect = chai.expect;
const should = chai.should();
let token: string;
let user: User;
let bankAccount: BankAccount;
let outGoingTransfer: Transaction;

describe("General transer tests", () => {
  before(async () => {
   
    let newUser = await insertUser({ email: "kosy@random.com" });
    user = newUser!;
    bankAccount = await createBankAccont(user.user_id);
    token = await createWebToken({
      email: user!.email,
      user_id: user!.user_id,
    });
   let transactions = await createTransactions(user.user_id, 3);
   outGoingTransfer = transactions[0];

  });
  after(async () => {
    await clearDb();
  });

  describe("init transfer tests", function () {
    it("should start a transfer /transactions/init", async () => {
      should.exist(token);
      should.exist(user);
      const response = await request(server.server!)
        .post(`/transactions/init`)
        .send({
          amount: 10,
          bank_code: "044",
          narration: "test-payment",
          account_number: "0069471301",
          account_name: "Kosisochukwu Allison",
          bank: "Access Bank",
        })
        .auth(token, { type: "bearer" });
      expect(response.status).to.be.eq(201);
      console.log(response.body.data, bankAccount);
      expect(response.body).to.include.keys(["message", "data"]);
      expect(response.body.data).to.include({
        user_id: user.user_id,
        status: "PENDING",
        amount: 20,
      });
    });
  });

  describe("fetch transfers test", () => {
    it("should get all 3 transfers in db", async () => {
      const response = await request(server.server!)
        .get(`/transactions/all`)
        .auth(token, { type: "bearer" });
        console.log(response.body)
      expect(response.status).to.be.eq(200);
      expect(response.body).to.include.keys(["data", "message", "status"]);

      expect(response.body.data).to.include.keys([
        "rows",
        "page",
        "size",
        "total",
        "payload",
      ]);
      expect(response.body.data.payload.length).to.eq(4)
      should.exist(response.body.data.payload[0]);
    });

    it("should get all deposits transfers in db", async () => {
        const response = await request(server.server!)
          .get(`/transactions/all/deposits`)
          .auth(token, { type: "bearer" });
        console.log(response.body);
        expect(response.status).to.be.eq(200);
        expect(response.body).to.include.keys(["data", "message", "status"]);
  
        expect(response.body.data).to.include.keys([
          "rows",
          "page",
          "size",
          "total",
          "payload",
        ]);
        expect(response.body.data.payload.length).to.eq(1)
        should.exist(response.body.data.payload[0]);
      });

      it("should get all user withdrawals transfers in db", async () => {
        const response = await request(server.server!)
          .get(`/transactions/all/withdrawals`)
          .auth(token, { type: "bearer" });
        console.log(response.body);
        expect(response.status).to.be.eq(200);
        expect(response.body).to.include.keys(["data", "message", "status"]);
  
        expect(response.body.data).to.include.keys([
          "rows",
          "page",
          "size",
          "total",
          "payload",
        ]);
        expect(response.body.data.payload.length).to.eq(3)
        should.exist(response.body.data.payload[0]);
      });
  });

  describe('webhooks test', () => {
    it('should handle transfer webhook',async () => {
        should.exist(outGoingTransfer);
        should.exist(outGoingTransfer.reference);
        expect(outGoingTransfer.type).to.eq('WITHDRAWAL');
        expect(outGoingTransfer.status).to.eq('PENDING');
        const webhookData = transferWebHookMock({merchant_ref: outGoingTransfer.reference});

        const responseWebhook = await request(server.server!)
        .post(`/transactions/webhook`)
        .send(webhookData)

        console.log(responseWebhook.body)

        expect(responseWebhook.status).to.eq(200);

        const response = await request(server.server!)
        .get(`/transactions/all`)
        .auth(token, { type: "bearer" });

        let newOutgoing = response.body.data.payload.find(p => p.reference === outGoingTransfer.reference );
        should.exist(newOutgoing);
        should.exist(newOutgoing.metaData);
        expect(newOutgoing.status).to.eq('SUCCESSFULL');



    })

    it('should handle collection webhook',async () => {
        should.exist(bankAccount)
        should.exist(bankAccount.bank_account_number)

        const webhookData = collectionWebhook({account_number: bankAccount.bank_account_number});

        const responseWebhook = await request(server.server!)
        .post(`/transactions/webhook`)
        .send(webhookData)
        console.log(responseWebhook.body)
        expect(responseWebhook.status).to.eq(200);

        const response = await request(server.server!)
        .get(`/transactions/all`)
        .auth(token, { type: "bearer" });
        
        expect(response.body.data.payload.length).to.be.eq(5);




    })
  })
});
