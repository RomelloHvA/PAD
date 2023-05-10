/**
 * this file contains ExpressJS stuff
 * @author Othaim Iboualaisen
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
        this.addLike();
        this.removeLike();
        this.AlreadyLiked();
    }

    addLike() {
        // Handle POST request to add a like
        this.#app.post("/storyboard/addLike", async (req, res) => {
            try {

                console.log("test")
                // Extract data from the request
                const { userID, storyID } = req.body;
                const data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO `like` (userID, storyID) VALUES (?, ?)",
                    values: [userID, storyID],
                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (exc) {
                // Handle errors
                console.error(exc);
            }
        });
    }

    removeLike() {
        // Handle POST request to remove a like
        this.#app.post("/storyboard/removeLike", async (req, res) => {
            try {
                // Extract data from the request
                const { userID, storyID } = req.body;
                const data = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM `like` WHERE userID = ? AND storyID = ?",
                    values: [userID, storyID],
                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (exc) {
                // Handle errors
                console.error(exc);
            }
        });
    }

    AlreadyLiked() {
            this.#app.get("/storyboard/getLike", async (req, res) => {
                const { userID, storyID } = req.body;
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT AlreadyLiked(?,?);",
                    values: [userID, storyID]
                });
                //give a response when an error occurs
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * this method fetches the data from a story
     * Othaim Iboualaisen
     */
    #getStory() {
        this.#app.post("/storyboard", async (req, res) => {
            try {
                let data;
                let query;

                let sortOrder = req.body.order;
                let sortField = req.body.field;
                let year = req.body.year;

                if (!sortOrder) sortOrder = "DESC";
                if (!sortField || sortField === "") sortField = "s.created_at";
                let whereClause = year ? `WHERE s.year = ${year}` : "";

                query = `
                    SELECT s.*, COUNT(l.storyID) AS likes, CONCAT(u.firstname, ' ', u.lastname) AS author
                    FROM story AS s
                        LEFT JOIN \`like\` AS l ON s.storyID = l.storyID
                        LEFT JOIN user AS u ON s.userID = u.userID 
                        ${whereClause}
                    GROUP BY s.storyID
                    ORDER BY ${sortField} ${sortOrder}`;


                data = await this.#databaseHelper.handleQuery({query});


                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }
}

module.exports = StoryboardRoutes;