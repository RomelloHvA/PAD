/**
 * Class for handling all the story routes
 */
class storyRoutes {
    #httpErrorCodes = require("../framework/utils/httpErrorCodes")
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
        this.#addStory();
        this.#getHighestRatedMessage();
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

                    res.status(this.#httpErrorCodes.HTTP_OK_CODE).json({message: "ok"});
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * This function returns the highest rated message of all time.
     * @author Romello ten Broeke
     */
    #getHighestRatedMessage(){
        this.#app.get("/story/highestRated", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT title, body FROM story WHERE upvote = (SELECT MAX(upvote) FROM story)"
                })
                if (data){
                    res.status(this.#httpErrorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }
}

module.exports = storyRoutes