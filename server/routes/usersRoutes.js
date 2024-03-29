/**
 * This class contains ExpressJS routes specific for the users entity
 * this file is automatically loaded in app.js
 *
 * @author Othaim Iboualaisen
 */

const rateLimit = require("express-rate-limit");

class UsersRoutes {
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
        this.#login()
        this.#signUp()
        this.#getSingleUser();
        this.#updateSingleUser();

        this.#getUserInfo();
        this.#getUserStories();
    }

    /**
     * Checks if passed username and password are found in db, if so let the front-end know
     * @private
     */
    #login() {
        this.#app.post("/users/login", this.loginLimiter, async (req, res) => {
            const body = req.body;
            const requiredFields = ['email', 'psw'];

            let countError = false;
            let messages = [];

            // Check if required fields are filled out
            requiredFields.forEach(field => {
                if (!body[field] || body[field] === '') {
                    countError = true;
                    messages.push({field, message: "Dit veld mag niet leeg zijn"});
                }
            });

            if (countError) {
                res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({
                    reason: messages
                });
                return;
            }

            //TODO: You shouldn't save a password unencrypted!! Improve this by using this.#cryptoHelper functions :)

            try {
                if (!await this.#emailExist(req.body.email)) {
                    messages.push({field: "*", message: "Incorrecte email en/of wachtwoord"});
                    res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({
                        reason: messages
                    });
                    return;
                }

                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT userID, password FROM user WHERE email = ?",
                    values: [req.body.email]
                });


                //One record was found, we know the user exists in users table.
                if (data[0].password === req.body.psw) {
                    //return just the username for now, never send password back!
                    return res.status(this.#errorCodes.HTTP_OK_CODE).json({
                        userID: data[0].userID,
                    });
                } else {
                    //wrong username
                    messages.push({field: "*", message: "Incorrecte email en/of wachtwoord"});
                    res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({
                            reason: messages
                    });
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    /**
     * Handles user signup requests
     *
     * @private
     */
    async #insertUser(req, res) {
        const {firstname, lastname, phoneNr, email, psw} = req.body;

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        try {
            const data = await this.#databaseHelper.handleQuery({
                query: "INSERT INTO user (firstname, lastname, phoneNr, email, password) VALUES (?, ?, ?, ?, ?)",
                values: [firstname, lastname, phoneNr, email, psw],
            });

            return res.status(this.#errorCodes.HTTP_OK_CODE).json({
                message: "Account succesvol aangemaakt",
                userID: data.insertId,
            });
        } catch (e) {
            res.status(this.#errorCodes.BAD_REQUEST_CODE).json({
                reason: e,
            });
        }
    }

    async #emailExist(email) {
        const exists = await this.#databaseHelper.handleQuery({
            query: "SELECT userID FROM user WHERE email = ?", values: [email],
        });

        if (exists && exists.length > 0) {
            return true;
        }

        return false;
    }

    async #signUp() {
        this.#app.post("/users/signup", async (req, res) => {
            const body = req.body;
            const requiredFields = ['firstname', 'lastname', 'phoneNr', 'email', 'psw', 'pswRepeat'];

            let countError = false;
            let messages = [];

            // Check if required fields are filled out
            requiredFields.forEach(field => {
                if (!body[field] || body[field] === '') {
                    countError = true;
                    messages.push({field, message: "Dit veld mag niet leeg zijn"});
                }
            });

            if (!countError) {
                const { email, psw, pswRepeat } = body;

                // Check if email is a proper email
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(email)) {
                    countError = true;
                    messages.push({ field: 'email', message: "Voer een geldige email in" });
                }

                // Check if password is at least 6 characters long
                if (psw.length < 6) {
                    countError = true;
                    messages.push({ field: 'psw', message: "Wachtwoord moet bestaan uit minimaal 6 karakters" });
                }

                // Check if password & passwordRepeat match
                if (psw !== pswRepeat) {
                    countError = true;
                    messages.push({ field: 'pswRepeat', message: "Wachtwoord komt niet overeen" });
                }

                // Check if email already exists
                if (await this.#emailExist(email)) {
                    countError = true;
                    messages.push({ field: 'email', message: "Dit email adres is al in gebruik, probeer in te loggen" });
                }
            }

            if (countError) {
                res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({
                    reason: messages
                });
                return;
            }

            await this.#insertUser(req, res);
        });
    }

    // Allow a maximum of 5 login requests per minute per IP address
    loginLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 5,
        message: "Too many login attempts, please try again later."
    });

    /**
     * Gets the data for a single User by the user ID.
     * @author Romello ten Broeke
     */

    #getSingleUser(){
        this.#app.get("/users/getSingleUser", async (req, res)=> {
            let userId = req.query.userID;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT firstName, lastName, email, phoneNr FROM user WHERE userID = ?",
                    values: [userId]
                })
                if (data){
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Updates the data for a given user except the password.
     * @author Romello ten Broeke
     */
    #updateSingleUser() {
        this.#app.patch("/users/updateSingleUser", async (req, res) => {
            const userData = req.body; // Parse JSON data from the request body

            if (userData) {
                try {
                    const data = await this.#databaseHelper.handleQuery({
                        query: "UPDATE user SET firstName = ?, lastName = ?, email = ?, phoneNr = ? WHERE userID = ?",
                        values: [userData.firstName, userData.lastName, userData.email, userData.phoneNr, userData.userID]
                    });

                    if (data) {
                        res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                    }
                } catch (e) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({ reason: e });
                }
            } else {
                res.status(this.#errorCodes.ROUTE_NOT_FOUND_CODE).json({ reason: "User can't be found" });
            }
        });
    }


    /**
     * Retrieves user information based on the provided user ID.
     *
     * @author Othaim Iboualaisen
     *
     * @description
     * This function handles a GET request to retrieve user information based on the provided user ID.
     * It expects the request to have a query parameter `userID` that represents the ID of the user.
     * The function asynchronously performs a database query to fetch the user's information.
     * The response will contain details about the user, including the total number of stories authored by the user,
     * the total number of likes given by the user, and the total number of likes received by the user.
     * If the user is not found, the response will have a status code indicating that the route was not found.
     * If there is an error during the database query, the function will throw an error with a descriptive message.
     */
    #getUserInfo(){
        this.#app.get("/users/getUserInfo", async (req, res)=> {
            let userID = req.query.userID;

            let query = `
                SELECT u.*,
                       COUNT(DISTINCT s.storyID) AS total_stories,
                       COUNT(l.storyID) AS total_likes_given,
                       SUM(CASE WHEN l.userID = u.userID THEN 1 ELSE 0 END) AS total_likes_received
                FROM user u
                         LEFT JOIN story s ON u.userID = s.userID
                         LEFT JOIN \`like\` l ON s.storyID = l.storyID
                WHERE u.userID = ${userID}
                GROUP BY u.userID`

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: query
                })
                if (data){
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }


    /**
     * Retrieves user stories based on the provided parameters.
     *
     * @author Othaim Iboualaisen
     *
     * @description
     * This function handles a POST request to retrieve user stories based on the provided parameters.
     * It expects the request body to have the following properties:
     * - `order` (optional): The sorting order for the stories. Default is "DESC".
     * - `field` (optional): The field to sort the stories by. Default is "s.created_at".
     * - `year` (optional): The year to filter the stories by.
     * - `userID`: The ID of the user to retrieve stories for.
     *
     * The function asynchronously performs a database query to fetch the user stories.
     * The response will contain an array of story objects, including details such as the story ID, content,
     * number of likes, and author name.
     *
     * If there is no sorting order specified, it will default to descending order.
     * If there is no sorting field specified, it will default to sorting by the story creation date.
     * If a year is provided, the query will filter the stories for that year.
     *
     * If the user is not found or there are no stories matching the specified criteria, the response will be an empty array.
     * If there is an error during the database query, the function will throw an error with a descriptive message.
     */
    #getUserStories(){
        this.#app.post("/users/getUserStories", async (req, res)=> {
            try {
                let data;
                let query;

                let sortOrder = req.body.order;
                let sortField = req.body.field;
                let year = req.body.year;
                let userID = req.body.userID;

                if (!sortOrder) sortOrder = "DESC";
                if (!sortField || sortField === "") sortField = "s.created_at";
                let whereClause = year ? `WHERE s.year = ${year} AND u.userID = ${userID}` : `WHERE u.userID = ${userID}`;

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

module.exports = UsersRoutes