const chai = require("chai");
const chaiHttp = require("chai-http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../app");
const userModel = require("../models/userModel");

chai.use(chaiHttp);
const { expect } = chai;

describe("User Authentication APIs", () => {
  let authToken;

  describe("POST /merny/api/v1/auth/register", () => {
    it("should register a new user", async () => {
      const response = await chai
        .request(app)
        .post("/merny/api/v1/auth/register")
        .send({
          username: "testuser",
          fullName: "Test User",
          email: "testuser@example.com",
          password: "testpassword",
          gender: "male",
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property("accessToken");
      authToken = response.body.accessToken;
    });

    it("should not register with existing email", async () => {
      const response = await chai
        .request(app)
        .post("/merny/api/v1/auth/register")
        .send({
          username: "existinguser",
          fullName: "Existing User",
          email: "testuser@example.com", // Use the email from the previous registration
          password: "password123",
          gender: "female",
        });

      expect(response).to.have.status(400);
      expect(response.body.message).to.equal(
        "Try any other email, this email is already registered!"
      );
    });
  });

  describe("POST /merny/api/v1/auth/login", () => {
    it("should log in with valid credentials", async () => {
      const response = await chai
        .request(app)
        .post("/merny/api/v1/auth/login")
        .send({
          email: "testuser@example.com",
          password: "testpassword",
        });

      expect(response).to.have.status(200);
      expect(response.body).to.have.property("accessToken");
    });

    it("should not log in with incorrect password", async () => {
      const response = await chai
        .request(app)
        .post("/merny/api/v1/auth/login")
        .send({
          email: "testuser@example.com",
          password: "incorrectpassword",
        });

      expect(response).to.have.status(401);
      expect(response.body.message).to.equal("Password is incorrect.");
    });

    it("should not log in with non-existing email", async () => {
      const response = await chai
        .request(app)
        .post("/merny/api/v1/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        });

      expect(response).to.have.status(400);
      expect(response.body.message).to.equal(
        "This email has not been registered!"
      );
    });
  });

  describe("POST /merny/api/v1/auth/logout", () => {
    it("should log out a user", async () => {
      const response = await chai
        .request(app)
        .post("/merny/api/v1/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          email: "testuser@example.com",
          password: "testpassword",
        });

      expect(response).to.have.status(200);
      expect(response.body.message).to.equal("Logged out!");
    });
  });

  // Clean up: Delete the test user from the database
  after(async () => {
    await userModel.deleteOne({ email: "testuser@example.com" });
  });
});
