const fs = require("fs");

/**
 * this file contains ExpressJS stuff
 * @author Othaim Iboualaisen & Tygo Geervliet & Rosalinde
 */

class StoryboardRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #app
    #multer = require("multer");

    /**
     * initialize
     * @param app is the expressJS
     */
    constructor(app) {
        this.#app = app;
        this.#getStory();
        this.#addLike();
        this.#removeLike();
        this.#AlreadyLiked();
        this.#getStoryByUserID();
        this.#deleteStory();
    }


    /**
     * Handle POST request to add a like.
     * @author Tygo Geervliet
     */
    #addLike() {
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

    /**
     * Handle POST request to remove a like.
     * @author Tygo Geervliet
     */
    #removeLike() {
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


    /**
     Handle POST request to check if a story is already liked by a user.
     @author Tygo Geervliet
     */
    #AlreadyLiked() {
            this.#app.post("/storyboard/getLike", async (req, res) => {
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
     * Handle POST request to retrieve stories by user ID.
     * @author Tygo Geervliet
     */
    #getStoryByUserID() {
        this.#app.post("/storyboard/getStoryByUserID", async (req, res) => {
            const { userID } = req.body;
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT getStorysByUser(?);",
                    values: [userID]
                });
                //give a response when an error occurs
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * Handle POST request to remove a story.
     * @author Tygo Geervliet
     */
    #deleteStory() {
        this.#app.post("/storyboard/removeStory", async (req, res) => {
            const { storyID } = req.body;
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "DELETE FROM story WHERE storyID = ?;",
                    values: [storyID]
                });
                //give a response when an error occurs
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }


    /**
     * Retrieves stories from the storyboard based on the provided parameters.
     *
     * @author Othaim Iboualaisen
     *
     * @description
     * This function handles a POST request to retrieve stories from the storyboard based on the provided parameters.
     * It expects the request body to have the following properties:
     * - `order` (optional): The sorting order for the stories. Default is "DESC".
     * - `field` (optional): The field to sort the stories by. Default is "s.created_at".
     * - `year` (optional): The year to filter the stories by.
     *
     * The function asynchronously performs a database query to fetch the stories from the storyboard.
     * The response will contain an array of story objects, including details such as the story ID, content,
     * number of likes, and author name.
     *
     * If there is no sorting order specified, it will default to descending order.
     * If there is no sorting field specified, it will default to sorting by the story creation date.
     * If a year is provided, the query will filter the stories for that year.
     *
     * If there are no stories in the storyboard or there are no stories matching the specified criteria,
     * the response will be an empty array.
     *
     * If there is an error during the database query, the function will throw an error with a descriptive message.
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