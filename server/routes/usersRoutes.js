/**
 * This class contains ExpressJS routes specific for the users entity
 * this file is automatically loaded in app.js
 *
 * @author Othaim Iboualaisen
 */
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
        this.#signup()
    }

    /**
     * Checks if passed username and password are found in db, if so let the front-end know
     * @private
     */
    #login() {
        this.#app.post("/users/login", async (req, res) => {
            const username = req.body.username;

            //TODO: You shouldn't save a password unencrypted!! Improve this by using this.#cryptoHelper functions :)
            const password = req.body.password;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT username, password FROM users WHERE username = ? AND password = ?",
                    values: [username, password]
                });

                //One record was found, we know the user exists in users table.
                if (data.length === 1) {
                    //return just the username for now, never send password back!
                    res.status(this.#errorCodes.HTTP_OK_CODE).json({"userID": data[0].userID});
                } else {
                    //wrong username
                    res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({reason: "Wrong username or password"});
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
    #signup() {
        this.#app.post("/users/signup", async (req, res) => {
            const { firstname, lastname, phoneNr, email, password } = req.body;

            // Hash the password
            // const hashedPassword = await bcrypt.hash(password, 10);

            // Check inputs and if they are valid execute the code below
            const inputsValid = await this.#checkInputs(req.body);
            if (!inputsValid) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({
                    reason: 'Invalid input fields.',
                });
                return;
            }

            // Check if email already exists
            const emailAlreadyExists = await this.#emailExist(email);
            if (emailAlreadyExists) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({
                    reason: 'Email already exists.',
                });
                return;
            }

            // Insert the new user into the database
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query:
                        "INSERT INTO user (firstname, lastname, phoneNr, email, password) VALUES (?, ?, ?, ?, ?)",
                    values: [firstname, lastname, phoneNr, email, password],
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({
                    message: "User created successfully.",
                    userID: data.insertId,
                });
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({
                    reason: e,
                });
            }
        });
    }

    async #emailExist(email) {
        const exists = await this.#databaseHelper.handleQuery({
            query: "SELECT userID FROM user WHERE email = ?",
            values: [email],
        });

        if (exists && exists.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    async #checkInputs(body) {
        const { firstname, lastname, phoneNr, email, password, passwordRepeat } = body;

        // Check if required fields are filled out
        if (!firstname || !lastname || !email || !password || !passwordRepeat) {
            return false;
        }

        // Check if email is a proper email
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Check if password is at least 6 characters long
        if (password.length < 6) {
            return false;
        }

        // Check if password & passwordRepeat match
        if (password !== passwordRepeat) {
            return false;
        }

        return true;
    }
}

module.exports = UsersRoutes