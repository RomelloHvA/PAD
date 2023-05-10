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

    #updateStory() {
        this.#app.post("/storyboard/edit", async (req, res) => {
            const { title, body, year, month, day, id } = req.body;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: `UPDATE story SET title = ?, body  = ?, year = ?, month = ?, day = ? WHERE storyID = ?`,
                    values: [title, body ,year, month, day, id]

                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }
}

module.exports = StoryboardRoutes;