/**
 * This class contains ExpressJS routes specific for the users entity
 * this file is automatically loaded in app.js
 *
 * @author Othaim Iboualaisen
 */

const rateLimit = require("express-rate-limit");
const {query} = require("express");
const cors = require('cors');
const nodemailer = require("nodemailer");
const fetch = require("node-fetch").default;

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
        this.#setRecoveryCode();
        // this.#getRecoveryCode();
        this.#setNewPassword();
        this.#sendMail();
        this.#getRecoveryCode();
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
                const {email, psw, pswRepeat} = body;

                // Check if email is a proper email
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(email)) {
                    countError = true;
                    messages.push({field: 'email', message: "Voer een geldige email in"});
                }

                // Check if password is at least 6 characters long
                if (psw.length < 6) {
                    countError = true;
                    messages.push({field: 'psw', message: "Wachtwoord moet bestaan uit minimaal 6 karakters"});
                }

                // Check if password & passwordRepeat match
                if (psw !== pswRepeat) {
                    countError = true;
                    messages.push({field: 'pswRepeat', message: "Wachtwoord komt niet overeen"});
                }

                // Check if email already exists
                if (await this.#emailExist(email)) {
                    countError = true;
                    messages.push({field: 'email', message: "Dit email adres is al in gebruik, probeer in te loggen"});
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

    #getSingleUser() {
        this.#app.get("/users/getSingleUser", async (req, res) => {
            let userId = req.query.userID;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT firstName, lastName, email, phoneNr FROM user WHERE userID = ?",
                    values: [userId]
                })
                if (data) {
                    res.status(this.#errorCodes.HTTP_OK_CODE).json(data)
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

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
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
                }
            } else {
                res.status(this.#errorCodes.ROUTE_NOT_FOUND_CODE).json({reason: "User can't be found"});
            }
        });
    }

    /**
     * set field recovery code selected person
     * @author roos
     */
    #setRecoveryCode() {
        this.#app.post("/users/setRecoveryCode", async (req, res) => {
            const code = req.body.code;
            const email = req.body.email;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE user SET recoveryCode = ? WHERE email =?",
                    values: [code, email]
                });
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }

     #sendMail() {
        this.#app.post("/users/sendMail",  async (req, res) => {
            const code = req.body.code;
            const email = req.body.email;

            try {
                const response = await fetch("https://api.hbo-ict.cloud/mail", {
                    method: "post",
                    headers: {
                        "Authorization": "Bearer pad_flo_4.lAhLBSjeNsJZEBhW",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        from: {
                            name: 'Florijn Friends',
                            address: 'group@hbo-ict.cloud'
                        },
                        to: [
                            {
                                name: 'Beste Meneer/Mevrouw',
                                address: email
                            }
                        ],
                        subject: 'Wachtwoord wijzigen',
                        html: 'Met deze code kunt u uw wachtwoord aanpassen: ' + code
                    })
                });

                const result = await response.json();

                res.status(this.#errorCodes.HTTP_OK_CODE).json(result);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }


    /**
     * set new password & remove recovery code so it cant be used again
     * @author roos
     */
    #setNewPassword() {
        this.#app.post("/users/setNewPassword", async (req, res) => {
            const password = req.body.password;
            const email = req.body.email;
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "UPDATE user SET password = ? WHERE email = ?",
                    values: [password, email]
                })
                try {
                    const otherData = await this.#databaseHelper.handleQuery({
                        query: "UPDATE user SET recoveryCode = ? WHERE email = ?",
                        values: [null, email]
                    })
                } catch (e) {
                    res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
                }
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }


    // post van gemaakt omdat een get geen data mee mocht geven. dan zou ik de mail dus niet mee kunnen geven. Bedoeling
    // is dat het de code die hier boven in de databas is gezet, teruggeven wordt om het te checken in de controller
    #getRecoveryCode() {
        this.#app.post("/users/getRecoveryCode", async (req, res) => {
            const mail = req.body.mail;

            try {
                const data = await this.#databaseHelper.handleQuery({
                    query: "SELECT recoveryCode FROM user WHERE email =?",
                    values: [mail]
                });
                // res.status(this.#errorCodes.HTTP_OK_CODE).json(data);
                res.send(data);
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        })
    }


}

module.exports = UsersRoutes