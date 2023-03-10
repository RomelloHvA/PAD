/**
 * Routes file for handling messages.
 * @author Romello ten Broeke
 */

class MessageRoutes {
    #app;
    #databaseHelper = require("../framework/utils/databaseHelper.js")
    #httpErrorCodes = require("../framework/utils/httpErrorCodes");


constructor(app) {
        this.#app = app;

        this.#getHighestRatedMessage();
    }

    /**
     * This function returns the highest rated message of all time.
     */
    #getHighestRatedMessage(){
        this.#app.get("/messages", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT title, body FROM story WHERE upvote = (SELECT MAX(upvote) FROM story)"
                })
                if (data){
                    res.status(this.#httpErrorCodes.HTTP_OK_CODE).json({data})
                }
            } catch (e) {
                res.status(this.#httpErrorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }
}

module.exports = MessageRoutes;