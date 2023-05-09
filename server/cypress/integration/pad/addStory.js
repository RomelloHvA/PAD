describe('My First Test', () => {
    beforeEach(() => {
        cy.visit("http://localhost:8080/#story");
    });

    it('Visits the addStory page', () => {});

    it("Valid ADDSTORY form", () => {
        cy.get("#subject").should("exist");
        cy.get("#month").should("exist");
        cy.get("#day").should("exist");
        cy.get("#year").should("exist");
        cy.get("#story").should("exist");
        cy.get("#fileInput").should("exist");
        cy.get("#myButton").should("exist");
    });

    it("Fails to submit incomplete form", () => {
        // Attempt to submit the form without filling out any fields
        cy.get("#myButton").click();
        cy.get(".error-message").should("contain", "Subject is required.");
        cy.get(".error-message").should("contain", "Month is required.");
        cy.get(".error-message").should("contain", "Day is required.");
        cy.get(".error-message").should("contain", "Year is required.");
        cy.get(".error-message").should("contain", "Story is required.");

        // Fill out the subject field and attempt to submit again
        cy.get("#subject").type("My Test Story");
        cy.get("#myButton").click();
        cy.get(".error-message").should("contain", "Month is required.");
        cy.get(".error-message").should("contain", "Day is required.");
        cy.get(".error-message").should("contain", "Year is required.");
        cy.get(".error-message").should("contain", "Story is required.");
    });

    it("Fails to submit with invalid date format", () => {
        // Fill out the form with an invalid date
        cy.get("#subject").type("My Test Story");
        cy.get("#month").select("February");
        cy.get("#day").select("31");
        cy.get("#year").select("2023");
        cy.get("#story").type("This is a test story.");
        cy.get("#myButton").click();

        // Verify that the form submission failed and the error message is displayed
        cy.get(".error-message").should("contain", "Please enter a valid date.");
    });

    it("Submits complete form successfully", () => {
        const subject = "My Test Story";
        const month = "April";
        const day = "20";
        const year = "2023";
        const story = "This is a test story.";
        const imageFilePath = "test-image.jpg";

        // Fill out the form
        cy.get("#subject").type(subject);
        cy.get("#month").select(month);
        cy.get("#day").select(day);
        cy.get("#year").select(year);
        cy.get("#story").type(story);

        // Upload an image
        cy.get('#fileInput[type="file"]').attachFile(imageFilePath);

        // Submit the form
        cy.get("#myButton").click();

        // Verify that the submission was successful and the user is redirected to the home page
        cy.url().should("eq", "http://localhost:8080/#home");
    });
});
