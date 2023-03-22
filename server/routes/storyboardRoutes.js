/**
 * this file contains ExpressJS stuff
 * @author Rosalinde
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
                    query: "SELECT title, body, image FROM story",

                });

                //give a response when an error occurs
                res.send(data)
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }
}

module.exports = StoryboardRoutes;