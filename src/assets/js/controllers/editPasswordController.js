import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";


/**
 * edit password including checks
 * @author roos
 */
export class EditPasswordController extends Controller {
    #loginView
    #storyRepository;
    #usersRepository;

    constructor() {
        super();
        this.#storyRepository = new storyRepository();
        this.#usersRepository = new UsersRepository();
        this.#setupView();
    }

    async #setupView() {

        this.#loginView = await super.loadHtmlIntoContent("html_views/editPassword.html");

        const mailButton = document.querySelector("#btn");
        mailButton.addEventListener("click", () => {
            this.#generateCode()
        });

        const codeButton = document.querySelector("#btnTwo");
        codeButton.addEventListener("click", async () => {
            await this.#checkCode()
        });
    }

    /**
     * get the two given passwords
     * @param email to link the passwords to the right user
     * @returns {Promise<void>}
     */
    async #validateNewPassword(email) {
        const newPasswordOne = this.#loginView.querySelector("#newPsw").value;
        const newPasswordTwo = this.#loginView.querySelector("#newPswRepeat").value;

        await this.newPassword(newPasswordOne, newPasswordTwo, email);
    }

    /**
     * checks the given passwords and sets when right
     * @param newPasswordOne
     * @param newPasswordTwo
     * @param email
     * @returns {Promise<void>}
     */
    async newPassword(newPasswordOne, newPasswordTwo, email) {
        if (newPasswordOne === newPasswordTwo) {

            const data = {
                password: newPasswordOne,
                email: email
            }
            window.alert("wachtwoord is aangepast");
            this.#loginView = await super.loadHtmlIntoContent("html_views/login.html");

            await this.#usersRepository.setNewPassword(data);


        } else {
            this.setErrorMessage();
        }
    }

    /**
     * gets all mails from database and the given mail
     * @returns {Promise<void>}
     */
    async #generateCode() {
        const data = await this.#usersRepository.getEmails();

        const email = this.#loginView.querySelector("#email");

        await this.checkGivenMail(data, email);
    }

    /**
     * checks if the mail exists in the database
     * @param data
     * @param email
     * @returns {Promise<void>}
     */
    async checkGivenMail(data, email) {
        for (let i = 0; i < data.length; i++) {

            if (email.value !== data[i].email) {
                this.sendMailNotExistMessage();

            } else {
                const recoveryCode = Math.floor(Math.random() * 90000000) + 10000000;

                this.sendEmailMessage();
                await this.setRecoveryCode(recoveryCode, email);
            }
        }
    }

    /**
     * sends mail with recoverycode and puts the code into the database
     * @param recoveryCode
     * @param email
     * @returns {Promise<void>}
     */
    async setRecoveryCode(recoveryCode, email) {
        const data = {
            code: recoveryCode,
            email: email.value
        }

        await this.#usersRepository.sendEmail(data);
        this.sendEmailMessage();

        console.log(recoveryCode);
        await this.#usersRepository.setRecoveryCode(data);
    }

    /**
     * gets the mail and code given and gets the code from the database
     * @returns {Promise<void>}
     */
    async #checkCode() {
        const mail = this.#loginView.querySelector("#email").value;

        const databaseCode = await this.#usersRepository.getRecoveryCode(mail);
        const givenCode = this.#loginView.querySelector("#psw").value;
        const parsedCode = Number.parseFloat(givenCode);

        await this.checkGivenCode(parsedCode, mail, databaseCode[0].recoveryCode);
    }

    /**
     * checks if code given and code from database are the same
     * @param parsedCode
     * @param mail
     * @param databaseCode
     * @returns {Promise<void>}
     */
    async checkGivenCode(parsedCode, mail, databaseCode) {

        if (parsedCode === databaseCode) {
            this.#loginView = await super.loadHtmlIntoContent("html_views/resetPassword.html");

            const recoverButton = document.querySelector("#recoveryBtn");
            recoverButton.addEventListener("click", () => {
                this.#validateNewPassword(mail)
            });
        } else {
            this.setErrorMessage()
        }
    }

    /**
     * gives message when email is not known in database
     */
    sendMailNotExistMessage(){
        this.#loginView.querySelector('.message').style.display = "flex";
        this.#loginView.querySelector('.message').style.color = "red";
        this.#loginView.querySelector('.message').innerHTML = "Email bestaat niet, registreer eerst";
    }

    /**
     * gives message that email has been send
     */
    sendEmailMessage() {
        this.#loginView.querySelector('.message').style.display = "flex";
        this.#loginView.querySelector('.message').style.color = "green";
        this.#loginView.querySelector('.message').innerHTML = "Email is verstuurd. Zie u mail voor de herstelcode";

        this.#loginView.querySelector('.code_field').style.display = "inherit";
        this.#loginView.querySelector('#btnTwo').style.display = "inherit";
        this.#loginView.querySelector('.vulCodeIn').style.display = "inherit";
    }

    /**
     * gives message that the fields are not correctly filled
     */
    setErrorMessage() {
        this.#loginView.querySelector('.message').style.display = "flex";
        this.#loginView.querySelector('.message').style.color = "red";
        this.#loginView.querySelector('.message').innerHTML = "De ingevulde velden komen niet overeen";
    }
}