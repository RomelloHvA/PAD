//Context: Welcome
import {HTTP_OK_CODE} from "../../../framework/utils/httpErrorCodes.js";

describe("Welcome", () => {
    const getMethod = "GET"
    const endpoint = "/story/highestRated";
    const storyDataArray = [
        {
        storyID: 1,
        title: 'Highest Story title',
        body: 'Highest story text',
        day: 25,
        month: 'April',
        year: 2023,
        visible: true,
        created_at: '2023-04-25T10:30:00Z',
        image: 'https://example.com/story.jpg',
        userID: 123 }
    ]

    //Does this before running each test. Goes to the homepage that is running on localhost 8080
    beforeEach(() => {
        cy.visit("http://localhost:8080");


    });
    //Test: find the field and button where the highest rated story should be.
    it("Valid highest rated story area.", () => {

        //Find the div for the area of the highest rated story.
        cy.get("#highest-rated-story").should("exist");

        // Find the title div
        cy.get("#storyTitle").should("exist");

        //Find the div where the maintext should go.
        cy.get(".story-text").should("exist");
    });

    //Test: get the highest Rated Story
    it("Should have loaded the highest rated story.", () => {

        //Fakes a server.
        cy.server();

        //Fakes an endpoint response with dummy data
        cy.intercept(getMethod, endpoint, storyDataArray).as('getHighestStory');
        //Times out if the response takes too long.
        cy.wait('@getHighestStory', {timeout: 10000}).then(() => {
            //Checks if the title contains the same as the dummy data.
            cy.get("#storyTitle").should("contain", storyDataArray[0].title);

            //Checks if the body contains the same as the dummy data.
            cy.get(".story-text").should("contain", storyDataArray[0].body);
        });



    })

    //Test this test should fail for getting the highest story
    it("Should fail for loading a story.", () => {

        //Fakes a server.
        cy.server();

        //Fakes an endpoint response with dummy data
        cy.intercept(getMethod, endpoint, storyDataArray).as('failHighestStory');

        //Times out if the response takes too long.
        cy.wait('@failHighestStory', {timeout: 10000}).then(() => {

            //Checks if the title contains the same as the dummy data.
            cy.get("#storyTitle").should("contain", storyDataArray[1].title);

            //Checks if the body contains the same as the dummy data.
            cy.get(".story-text").should("contain", storyDataArray[1].body);
        });
    });
});