//Context: edit story
describe("edit story", () => {
    const endpoint = "/storyboard";

    //run before each test in this context
    beforeEach(() => {
        //go to url
        cy.visit("http://localhost:8080/#storyboard") // moet hier nog wat achter?
    });

    //test if buttons is there
    it ("find edit button", () => {
        //start a fake server
        cy.server();

        const mockedResponse = {"button":  "dit is een mocked response"}; // wat is de respone?

        cy.intercept('GET', '/storyboard', {
            statusCode: 200,
            body: mockedResponse,
        }).as('editButton')

        //find the button
        cy.get("#exampleEditButton").should("exist");
    })
})