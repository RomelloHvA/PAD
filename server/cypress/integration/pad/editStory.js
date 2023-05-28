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

    it("check op alle benodigde velden", () => {
        cy.get(".fa-pencil-alt").first().should("be.visible").click({force: true});
        cy.get("#subject").should("exist");
        cy.get("#date").should("exist");
        cy.get("#story").should("exist");
        cy.get("#fileInput").should("exist");
        cy.get("#myButton").should("exist");
    })

    it("vul verkeerde dingen in", () => {
        cy.get(".fa-pencil-alt").first().should("be.visible").click({force: true});
        cy.get("#subject").type(" ");
        cy.get("#story").type(" ");
        cy.get("myButton").click({force: true});
    })
})