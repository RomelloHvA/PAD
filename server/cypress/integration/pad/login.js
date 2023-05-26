/**
 * @description Cypress test suite for the login functionality.
 * @memberof Cypress.Test
 * @name Login
 * @author Othaim Iboualaisen
 */
describe("Login",  () => {
    const endpoint = "/users/login";

    /**
     * @description Run before each test in the login context.
     * @memberof Cypress.Test.Login
     * @function beforeEach
     */
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#login");
    });

    /**
     * @description Test case to validate the login form.
     * @memberof Cypress.Test.Login
     * @function itValidLoginForm
     */
    it("Valid login form", () => {
        //Find the field for the username, check if it exists.
        cy.get("#email").should("exist");

        //Find the field for the password, check if it exists.
        cy.get("#psw").should("exist");

        //Find the button to login, check if it exists.
        cy.get("#btn").should("exist");
    });

    /**
     * @description Test case for successful login.
     * @memberof Cypress.Test.Login
     * @function itSuccessfulLogin
     */
    it("Successful login",  () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"email": "test"};

        //Add a stub with the URL /users/login as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @login
        cy.intercept('POST', endpoint, {
            statusCode: 200,
            body: mockedResponse,
        }).as('login');

        //Find the field for the username and type the text "test".
        cy.get("#email").type("test");

        //Find the field for the password and type the text "test".
        cy.get("#psw").type("test");

        //Find the button to login and click it
        console.log(cy.get("#btn"));
        cy.get("#btn").click();

        //Wait for the @login-stub to be called by the click-event.
        cy.wait("@login");

        //The @login-stub is called, check the contents of the incoming request.
        cy.get("@login").should((xhr) => {
            //The username should match what we typed earlier
            const body = xhr.request.body;

            /**
             * @description The username should match what was typed earlier.
             * @memberof Cypress.Test.Login.itSuccessfulLogin
             * @param {string} body.email - The email value from the request body.
             * @returns {void}
             */
            expect(body.email).equals("test");

            /**
             * @description The password should match what was typed earlier.
             * @memberof Cypress.Test.Login.itSuccessfulLogin
             * @param {string} body.psw - The password value from the request body.
             * @returns {void}
             */
            expect(body.psw).equals("test");
        });

        //After a successful login, the URL should now contain #welcome.
        cy.url().should("contain", "#welcome");
    });

    /**
     * @description Test case for failed login.
     * @memberof Cypress.Test.Login
     * @function itFailedLogin
     */
    it("Failed login", () => {
        // Start a fake server
        cy.server();

        const mockedResponse = {
            reason: [{ field: "email", message: "Incorrecte email en/of wachtwoord" }],
        };

        // Add a stub with the URL /users/login as a POST
        // Respond with a JSON object when requested and set the status code to 401.
        // Give the stub the alias: @login
        cy.intercept("POST", endpoint, {
            statusCode: 401,
            body: mockedResponse,
        }).as("login");

        // Find the field for the username and type the text "test".
        cy.get("#email").type("test");

        // Find the field for the password and type the text "test".
        cy.get("#psw").type("test");

        // Find the button to login and click it.
        cy.get("#btn").click();

        // Wait for the @login-stub to be called by the click event.
        cy.wait("@login");

        // After a failed login, an element containing our error message should be shown.
        cy.get(".message")
            .should("exist")
            .should("contain", "Incorrecte email en/of wachtwoord");
    });

});