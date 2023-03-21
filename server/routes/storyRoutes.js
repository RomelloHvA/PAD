class storyRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #cryptoHelper = require("../framework/utils/cryptoHelper");
    #app

    /**
     * @param app - ExpressJS instance(web application) we get passed automatically via app.js
     * Important: always make sure there is an app parameter in your constructor!
     */
    constructor(app) {
        this.#app = app;

        //call method per route for the users entity
        this.#addStory()
    }


    #addStory() {
        this.#app.post("/story/add", async (req, res) => {
            const subject = req.body.subject;
            const story = req.body.story;
            const year = req.body.year;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO story (body, title, date) VALUES (?, ?, ?);",
                    values: [story, subject, year]
                });

                //if we founnd one record we know the user exists in users table

                    res.status(this.#errorCodes.HTTP_OK_CODE).json({message: "ok"});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }
}

module.exports = storyRoutes