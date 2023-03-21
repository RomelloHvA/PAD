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
        this.#checkInputs()
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
    async #signup(req, res) {
            const { firstname, lastname, phoneNr, email, password } = req.body;

            // Hash the password
            // const hashedPassword = await bcrypt.hash(password, 10);


            // Insert the new user into the database
            try {
                const data = await this.#databaseHelper.handleQuery({
                    query:
                        "INSERT INTO user (firstname, lastname, phoneNr, email, password) VALUES (?, ?, ?, ?, ?)",
                    values: [firstname, lastname, phoneNr, email, password],
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({
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
            query: "SELECT userID FROM user WHERE email = ?",
            values: [email],
        });

        if (exists && exists.length > 0) {
            return true;
        }

        return false;
    }

    async #checkInputs() {
        this.#app.post("/users/signup", async (req, res) => {
            const body = req.body;
            const {firstname, lastname, phoneNr, email, psw, pswRepeat} = body;

            let countError = true;
            let messages = [];


            // Check if required fields are filled out
            if (!firstname || firstname === '') {
                countError = false;
                messages.push({field: 'firstname', message: "Dit veld mag niet leeg zijn"});
            }

            if (!lastname || lastname === '') {
                countError = false;
                messages.push({field: 'lastname', message: "Dit veld mag niet leeg zijn"});
            }

            if (!email || email === '') {
                countError = false;
                messages.push({field: 'email', message: "Dit veld mag niet leeg zijn"});
            } else {
                // Check if email is a proper email
                const emailRegex = /\S+@\S+\.\S+/;
                if (!emailRegex.test(email)) {
                    countError = false;
                    messages.push({field: 'email', message: "Voer een geldige email in"});
                }
            }

            if (!psw || psw === '') {
                countError = false;
                messages.push({field: 'psw', message: "Dit veld mag niet leeg zijn"});

            } else {
                // Check if password is at least 6 characters long
                if (psw.length < 6) {
                    countError = false;
                    messages.push({field: 'psw', message: "Wachtwoord moet bestaan uit minimaal 6 karakters"});
                }
            }

            if (!pswRepeat || pswRepeat === '') {
                countError = false;
                messages.push({field: 'pswRepeat', message: "Dit veld mag niet leeg zijn"});
            } else {
                // Check if password & passwordRepeat match
                if (psw !== pswRepeat) {
                    countError = false;
                    messages.push({field: 'pswRepeat', message: "Wachtwoord komt niet overeen"});
                }
            }

            if (!countError) {
                res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({
                    reason: messages
                });
                return;
            }

            // Check if email already exists
            if (await this.#emailExist(email)) {
                res.status(this.#errorCodes.AUTHORIZATION_ERROR_CODE).json({
                    reason: [{
                        field: 'email',
                        message: "Dit email adres is al in gebruik, probeer in te loggen"
                    }]
                });
                return;
            }

            await this.#signup(req, res);

        });
    }
}

module.exports = UsersRoutes