
describe("Login",  () => {
    beforeEach(() => {
        //Go to the specified URL
        cy.visit("http://localhost:8080/#register");
        cy.server();

    });

    /**
     * look for the fields that should be present
     * @author roos
     */
    it("find all the fields", () => {
        cy.get("#firstname").should("exist");
        cy.get("#lastname").should("exist");
        cy.get("#phoneNr").should("exist");
        cy.get("#email").should("exist");
        cy.get("#psw").should("exist");
        cy.get("#pswRepeat").should("exist");
        cy.get("#btn").should("exist");
    })

    /**
     * enter random data for email and passwords that do not match
     * @author roos
     */
    it("enter wrong email and password", () => {
        cy.get("#firstname").type("voornaam");
        cy.get("#lastname").type("achternaam");
        cy.get("#phoneNr").type("061234567");
        cy.get("#email").type("mail");
        cy.get("#psw").type("testende");
        cy.get("#pswRepeat").type("testendetest");
        cy.get("#btn").click();

        cy.get(".emailSmall").should("contain", "Voer een geldige email in");
        cy.get("#pswSmallRepeat").should("contain", "Wachtwoord komt niet overeen");
    })

    /**
     * enter a password thats too short
     * @author roos
     */
    it("enter short password", () => {
        cy.get("#firstname").type("voornaam");
        cy.get("#lastname").type("achternaam");
        cy.get("#phoneNr").type("061234567");
        cy.get("#email").type("this@mail.com");
        cy.get("#psw").type("tst");
        cy.get("#pswRepeat").type("tst");
        cy.get("#btn").click();

        cy.get("#pswSmall").should("contain", "Wachtwoord moet bestaan uit minimaal 6 karakters")
    })

    /**
     * enter already existing mail
     * @author roos
     */
    it("enter already existing mail", () => {
        cy.get("#firstname").type("voornaam");
        cy.get("#lastname").type("achternaam");
        cy.get("#phoneNr").type("061234567");
        cy.get("#email").type("test@gmail.com");
        cy.get("#psw").type("testtest");
        cy.get("#pswRepeat").type("testtest");
        cy.get("#btn").click();

        cy.get(".emailSmall").should("contain", "Dit email adres is al in gebruik, probeer in te loggen")
    })

    /**
     * enter all correct data but don't put it into database
     * @author roos
     */
    it("enter correct data", () => {
        cy.intercept('POST', '/users/signup', {
            statusCode: 200,
        }).as('register');

        cy.get("#firstname").type("John");
        cy.get("#lastname").type("Doe");
        cy.get("#phoneNr").type("0612345678");
        cy.get("#email").type("JohnDoe@gmail.com");
        cy.get("#psw").type("ThisIsJohnDoe");
        cy.get("#pswRepeat").type("ThisIsJohnDoe");
        cy.get("#btn").click();

        cy.wait("@register");

        cy.get("@register").should((xhr) => {

            const body = xhr.request.body;

            expect(body.firstname).equals("John");
            expect(body.lastname).equals("Doe");
            expect(body.phoneNr).equals("0612345678");
            expect(body.email).equals("JohnDoe@gmail.com");
            expect(body.psw).equals("ThisIsJohnDoe");
            expect(body.pswRepeat).equals("ThisIsJohnDoe");

        });
    })
})