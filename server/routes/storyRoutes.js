const fs = require("fs");


class storyRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");
    #cryptoHelper = require("../framework/utils/cryptoHelper");
    #app
    #multer = require("multer");

    constructor(app) {
        this.#app = app;
        this.#addStory();
        this.#getHighestRatedMessageForYear();
        this.#getHighestRatedMessage();
        this.#updateStory();
        this.#getSingleStory();
        this.#getMaxUpvotesForStory();
        this.#getTotalUpvotesForUser();
        this.#getAllForUser();
        this.#getTopThree();
        this.#getMoreFromUser();
    }

    /**
     * Handle POST request to add a story.
     * @author Tygo Geervliet
     */
    //Handles a POST request to add a story to the database.
    #addStory() {
        // Handle POST request to add a story
        this.#app.post("/story/add", this.#multer().single("file"), async (req, res) => {

            console.log('req reached');
            try {
                // Extract data from the request
                const {body: {subject, story, year, month, day, userID}, file} = req;

                let fileUrl = '';

                // Check if a file was uploaded and write it to disk
                if (file != null) {
                    fileUrl = await this.#writeUploadedFileToDisk(file);
                    if (!fileUrl) {
                        // If an error occurred while writing to disk, send a bad request response
                        return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: 'Error writing file to disk'});
                    }
                }
                const newStory = {story, subject, year, month, day, fileUrl, userID}
                // Add the story to the database
                await this.#addToDatabase(newStory);

            } catch (e) {
                // If an error occurred while processing the request, send a bad request response
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**

     Adds a new story to the database.
     @async
     @param MyStory - An object containing the details of the story to be added.
     @param MyStory.story - The text of the story.
     @param MyStory.subject - The subject of the story.
     @param MyStory.year - The year of the story.
     @param MyStory.fileUrl - The URL of the file uploaded with the story.
     @throws If an error occurred while adding the story to the database.

     @author Tygo Geervliet
     */
    async #addToDatabase(newStory) {
        try {
            // Add the story to the database
            await this.#databaseHelper.handleQuery({
                query: "CALL UpdateStory(?, ?, ?, ?, ?, ?, ?)",
                values: [newStory.story, newStory.subject, newStory.year, newStory.fileUrl, newStory.month, newStory.day, newStory.userID],
            });
        } catch (e) {
            // If an error occurred while adding the story to the database, delete the uploaded image and send a bad request response
            fs.unlink(`${wwwrootPath}/uploads/${newStory.fileUrl}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    /**
     Extracts the file extension from the provided file object.
     @param {Object} file - The file object to extract the extension from.
     @returns {string} The file extension.

     @author Tygo Geervliet
     */
    #getFileExtension(file) {

        let fileExtension = file.originalname;
        const lastDotIndex = fileExtension.lastIndexOf(".");
        if (lastDotIndex !== -1) {
            return fileExtension.substring(lastDotIndex + 1);
        }
    }

    /**
     Writes an uploaded file to disk (uploads folder) and returns the URL of the saved file.
     @async
     @param {object} file - The uploaded file to write to disk.
     @returns {Promise<string|null>} - The URL of the saved file, or null if an error occurred while writing to disk.

     @author Tygo Geervliet
     */
    async #writeUploadedFileToDisk(file) {

        const timestamp = new Date().getTime();
        const fileUrl = `uploads/${timestamp}.${this.#getFileExtension(file)}`;
        try {
            await fs.promises.writeFile(`${wwwrootPath}/${fileUrl}`, file.buffer);
            return fileUrl;
        } catch (err) {
            console.log(err);
            // If an error occurred while writing to disk, delete the file and return null
            await fs.promises.unlink(`${wwwrootPath}/${fileUrl}`);
            return null;
        }
    }

    /**
     * Gets the highest rated story of all time.
     * @author Romello ten Broeke
     */

    #getHighestRatedMessage() {
        this.#app.get("/story/highestRated", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT s.* FROM story s LEFT JOIN `like` l ON s.storyID = l.storyID GROUP BY s.storyID ORDER BY COUNT(l.userID) DESC, s.storyID ASC LIMIT 1"
                })
                if (data) {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }

    /**
     * Gets the highest rated story per year using the like table and counting the userID who liked a story and joining it on the story table.
     * If there are no likes it will still return a story. If a story has the same amount of likes it will still return 1 story.
     * @author Romello ten Broeke
     */
    #getHighestRatedMessageForYear() {
        this.#app.get("/story/highestRatedPerYear", async (req, res) => {
            const year = req.query.year;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT s.storyID, s.title, s.body, s.year, s.image FROM story s LEFT JOIN `like` l ON s.storyID = l.storyID WHERE s.year = ? GROUP BY s.storyID ORDER BY COUNT(l.userID) DESC LIMIT 1",
                    values: [year]
                })
                if (data) {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }

    /**
     * API endpoint for getting a single story by its ID and the author first and last name. Checks is if there is a storyID
     * If the storyID can't be found in the database responds with a 404 error-code And if the storyID is empty it wil give a bad request.
     * @author Romello ten Broeke && Othaim Iboualaisen
     */

    #getSingleStory() {
        this.#app.get("/story/singleStory", async (req, res) => {
            let storyId = req.query.storyId;
            let query = `
                SELECT 
                    s.*, 
                    u.image AS profileImg,
                    CONCAT(u.firstName, ' ', u.lastName) AS author,
                    COALESCE(l.likeCount, 0) AS likes
                FROM story s
                         LEFT JOIN user u ON s.userID = u.userID
                         LEFT JOIN (
                    SELECT storyID, COUNT(*) AS likeCount
                    FROM \`like\`
                    GROUP BY storyID
                ) l ON s.storyID = l.storyID
                WHERE s.storyID = ${storyId}
            `

            if (storyId.length >= 1) {

                try {
                    const data = await this.#databaseHelper.handleQuery({
                        query: query
                    })

                    if (Object.keys(data).length === 0) {
                        res.status(this.#errorCodes.ROUTE_NOT_FOUND_CODE).json({reason: this.#errorCodes.ROUTE_NOT_FOUND_CODE});
                    } else {
                        res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                    }
                } catch (e) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                }
            } else {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({
                    reason: "StoryID can't be empty."
                })
            }


        })
    }


    /**
     * API endpoint for getting all the likes for a given storyID.
     * @author Romello ten Broeke
     */
    #getMaxUpvotesForStory() {
        this.#app.get("/story/getUpvoteForStoryId", async (req, res) => {
            let storyId = req.query.storyId;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT COUNT(like.userID) AS total_likes FROM story RIGHT JOIN `like` ON story.storyID = like.storyID WHERE like.storyID = ?",
                    values: [storyId]
                })
                if (data) {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * This method puts the new data in the database
     * @author Roos
     */
    #updateStory() {
        this.#app.post("/storyboard/edit",this.#multer().single("image"), async (req, res) => {
            const {body:{ title, body, year, month, day, id, otherImage }, file} = req;

            try {
                let fileUrl = '';

                // Check if a file was uploaded and write it to disk
                if (file != null) {
                    fileUrl = await this.#writeUploadedFileToDisk(file);
                    if (!fileUrl) {
                        // If an error occurred while writing to disk, send a bad request response
                        return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: 'Error writing file to disk'});
                    }
                } else {
                    fileUrl = otherImage;
                }

                const data = await this.#databaseHelper.handleQuery({
                    query: `UPDATE story SET title = ?, body  = ?, year = ?, month = ?, day = ?, image = ? WHERE storyID = ?`,
                    values: [title, body ,year, month, day, fileUrl, id]

                });
                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

    /**
     * Get the total upvotes for a given user
     * @author Romello ten Broeke
     */
    #getTotalUpvotesForUser() {
        this.#app.get("/story/getUpvoteForUserId", async (req, res) => {
            let userID = req.query.userId;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT COUNT(*) AS total_likes FROM `like` WHERE storyID IN (SELECT storyID FROM `story` WHERE userID = ?)",
                    values: [userID]
                })
                if (data) {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Gets all the stories data for a given user.
     * @author Romell0 ten Broeke
     */
    #getAllForUser(){
        this.#app.get("/story/getAllForUser", async (req, res) => {
            let userID = req.query.userId;

            if (userID){
                try {
                    const data = await this.#databaseHelper.handleQuery({
                        query: "SELECT storyID, title, body, day, month, year, created_at, image FROM story WHERE userID = ?",
                        values: [userID]
                    })
                    if (data){
                        res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                    }
                } catch (e) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                }
            } else {
                res.status(this.#errorCodes.ROUTE_NOT_FOUND_CODE).json({reason: "User doesn't exist."});
            }
        })
    }

    #getTopThree(){
        this.#app.get("/story/getTopThree", async (req, res) => {
            let query = `
                SELECT 
                    s.*,
                    CONCAT(u.firstName, ' ', u.lastName) AS author
                FROM story s
                LEFT JOIN user u ON s.userID = u.userID
                INNER JOIN (
                    SELECT storyID, COUNT(*) AS like_count
                    FROM \`like\`
                    GROUP BY storyID
                    ORDER BY like_count DESC
                    LIMIT 3
                ) AS top_stories ON s.storyID = top_stories.storyID
                ORDER BY top_stories.like_count DESC;
            `

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: query
                })
                if (data){
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    #getMoreFromUser(){
        this.#app.get("/story/getMoreFromUser", async (req, res) => {
            let userID = req.query.userId;
            let storyID = req.query.storyId;

            let query = `
                SELECT 
                    s.*, 
                    CONCAT(u.firstName, ' ', u.lastName) AS author
                FROM story s
                    JOIN user u ON s.userID = u.userID
                WHERE s.userID = ${userID} AND s.storyID != ${storyID}
                ORDER BY s.created_at DESC
                LIMIT 3;
            `

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: query
                })
                if (data){
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }
}

module.exports = storyRoutes;
