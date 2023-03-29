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
    }

    /**
     * @author Tygo Geervliet
     */
    //Handles a POST request to add a story to the database.
    #addStory() {
        // Handle POST request to add a story
        this.#app.post("/story/add", this.#multer().single("file"), async (req, res) => {
            try {
                // Extract data from the request
                const {body: {subject, story, year, month, day}, file} = req;

                let fileUrl = '';

                // Check if a file was uploaded and write it to disk
                if (file != null) {
                    fileUrl = await this.#writeUploadedFileToDisk(file);
                    if (!fileUrl) {
                        // If an error occurred while writing to disk, send a bad request response
                        return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: 'Error writing file to disk'});
                    }
                }
                const newStory = {story, subject, year, month, day, fileUrl}
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
                query: "CALL UpdateStory(?, ?, ?, ?, ?, ?)",
                values: [newStory.story, newStory.subject, newStory.year, newStory.fileUrl, newStory.month, newStory.day],
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

    #getHighestRatedMessage() {
        this.#app.get("/story/highestRated", async (req, res) => {
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT title, body FROM story WHERE upvote = (SELECT MAX(upvote) FROM story)"
                })
                if (data) {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        });
    }

    #getHighestRatedMessageForYear() {
        this.#app.get("/story/highestRatedPerYear", async (req, res) => {
            const year = req.query.year;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM story WHERE upvote = (SELECT MAX(upvote) FROM story WHERE year = (?)) GROUP BY year DESC LIMIT 1",
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
}

module.exports = storyRoutes;
