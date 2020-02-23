//During the test the env variable is set to test
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../build/index');
let should = chai.should();
const expect = require("chai").expect;

chai.use(chaiHttp);
//Our parent block
describe('API Unit Testing', () => {
    var d = new Date();
    var n = d.getSeconds();
    // Task 1 Endpoint: POST /api/register
    describe('POST /api/register', () => {
        it('it should register one or more students to a specified teacher..', (done) => {

            const req_data =   {
                "teacher": "Test"+n+"@gmail.com",
                "students":
                        [
                            "student"+n+"1@gmail.com",
                            "student"+n+n+"@gmail.com",
                        ]
            };
            chai.request(server)
            .post('/api/register')
            .send(req_data)
            .end((err, res) => {
                expect(res.status).to.equal(204);
              done();
            });
    });
     //Task 2 GET /api/commonstudents
    describe('GET /api/commonstudents', () => {
        it('it should GET a list of students common to a given list of teachers', (done) => {
          chai.request(server)
              .get('/api/commonstudents/')
              .query({teacher: decodeURI("Test"+n+"@gmail.com")})
              .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('students');
                done();
              });
        });
    });
    // Task 3 POST /api/suspend 
    describe('POST /api/suspend ', () => {
        it('it should suspend a specified student.', (done) => {
            let req_data = {
                "student": "student"+n+"1@gmail.com"
            }
            chai.request(server)
            .post('/api/suspend')
            .send(req_data)
            .end((err, res) => {
                expect(res.status).to.equal(204);
                // res.body.should.be.a('object');
            done();
            });
        });
    });
    // Task 4 POST /api/retrievefornotifications
    describe('POST /api/retrievefornotifications ', () => {
        it('it should return a list of students who can receive a given notification.', (done) => {
              chai.request(server)
              .post('/api/retrievefornotifications')
              .send({
                "teacher": "Test"+n+"@gmail.com",
                "notification": "hello @ek@gmail.com how are you? do you know @bobexample.com?"
            })
              .end((err, res) => {
                  expect(res.status).to.equal(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('recipients');
                done();
              });
        });
    });
});

});