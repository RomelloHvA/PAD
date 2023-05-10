/**
 * this file contains ExpressJS stuff
 * @author Rosalinde & Othaim Iboualaisen
 */


class StoryboardRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app

    /**
     * initialize
     * @param app is the expressJS
     */
    constructor(app) {
        this.#app = app;

        this.#getStory();
        this.#updateStory();
    }


    /**
     * this method fetches the data from a story
     * Roos
     */
    #getStory() {
        this.#app.get("/storyboard", async (req, res) => {

            //get the title, body and image from the story table
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM story",

                });

                //give a response when an error occurs
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * This method x
     * Roos
     */
    //id say the method needs the new story data to be given along
    #updateStory() {
        this.#app.put("/storyboard/edit", async (req, res) => {

            const title = req.query.title;
            const story = req.query.story;
            const year = req.query.year;
            const month = req.query.month;
            const day = req.query.day;

            console.log("update story wordt aangeroepen")

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: `UPDATE (subject, story, year, month, day)
                            SET `,
                    values: [title, story, year, month, day]

                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })

    }
}

module.exports = StoryboardRoutes;