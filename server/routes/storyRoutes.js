const fs = require("fs");
const { v4: uuidv4 } = require('uuid');

class storyRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes")
    #databaseHelper = require("../framework/utils/databaseHelper")
    #cryptoHelper = require("../framework/utils/cryptoHelper");
    #app
    #multer = require("multer");



    constructor(app) {
        this.#app = app;
        this.#addStory();
    }


    #addStory() {
        // Handle POST request to add a story
        this.#app.post("/story/add", this.#multer().single("file"), async (req, res) => {
            try {
                // Extract relevant data from the request
                const { body: { subject, story, year }, file: { buffer } } = req;
                console.log(req.file);

                // If no file was uploaded, send a bad request response
                if (!buffer) {
                    return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: "No file was uploaded." });
                }

                // Generate a unique filename for the uploaded image
                const fileName = uuidv4() + ".jpg";
                // Set the file path where the uploaded image will be saved
                const filePath = `${wwwrootPath}/uploads/${fileName}`;
                // Write the uploaded file to disk
                fs.writeFile(filePath, buffer, async (err) => {
                    if (err) {
                        console.log(err);
                        // If an error occurred while writing to disk, send a bad request response
                        return res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: err });
                    }

                    // Construct the URL of the uploaded file
                    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
                    console.log(fileUrl);

                    try {
                        // Add the story to the database
                        await this.#databaseHelper.handleQuery({
                            query: "INSERT INTO story (body, title, date, image) VALUES (?, ?, ?, ?);",
                            values: [story, subject, year, fileUrl],
                        });

                        // Send a success response if the story was added successfully
                        res.status(this.#errorCodes.HTTP_OK_CODE).json("ok");
                    } catch (e) {
                        // If an error occurred while adding the story to the database, delete the uploaded image and send a bad request response
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: e });
                    }
                });
            } catch (e) {
                // If an error occurred while processing the request, send a bad request response
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: e });
            }
        });
    }

}




module.exports = storyRoutes;
