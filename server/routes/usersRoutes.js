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
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT email, password FROM user WHERE email = ? AND password = ?",
                    values: [req.body.email, req.body.psw]
                });

                //One record was found, we know the user exists in users table.
                if (data.length === 1) {
                    //return just the username for now, never send password back!
                    res.status(this.#errorCodes.HTTP_OK_CODE).json({"id": data[0].userID});
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
        const {firstname, lastname, phoneNr, email, password} = req.body;

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);


        // Insert the new user into the database
        try {
            const data = await this.#databaseHelper.handleQuery({
                query: "INSERT INTO user (firstname, lastname, phoneNr, email, password) VALUES (?, ?, ?, ?, ?)",
                values: [firstname, lastname, phoneNr, email, password],
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


}

module.exports = UsersRoutes