describe('Addstory tests', () => {
    beforeEach(() => {
        window.localStorage.setItem('session', JSON.stringify({"userID":1}))
        cy.visit("http://localhost:8080/#addStory");
    });

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
        cy.get("#subject-error").should("contain", "Please fill in the subject field");

        // Fill out the subject field and attempt to submit again
        cy.get("#subject").type("My Test Story");
        cy.get("#myButton").click();
        cy.get("#story-error").should("contain", "Please fill in the story field");
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
        cy.get("#fileInput").attachFile(imageFilePath);

        // Submit the form
        cy.get("#myButton").click();

        // Confirm
        cy.get(".modal-buttons").click();

        // Verify that the submission was successful and the user is redirected to the home page
        cy.url().should("eq", "http://localhost:8080/#storyboard");
    });
});
