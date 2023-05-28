describe('editStory tests', () => {
    beforeEach(() => {
        window.localStorage.setItem('session', JSON.stringify({"userID": 6}))
        cy.visit("http://localhost:8080/#storyboard");
    });

    it("look for edit button", () => {
        cy.get(".fa-pencil-alt").should("exist");
    })

    it("click button, open edit screen", () => {
        cy.get(".fa-pencil-alt").first().should("be.visible").click({force: true});
        cy.get("#date").should("exist");
    })
})