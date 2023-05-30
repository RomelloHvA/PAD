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

    async #validateNewPassword(email) {
        const newPasswordOne = this.#loginView.querySelector("#newPsw").value;
        const newPasswordTwo = this.#loginView.querySelector("#newPswRepeat").value;

        await this.setNewPassword(newPasswordOne, newPasswordTwo, email);
    }

    async setNewPassword(newPasswordOne, newPasswordTwo, email) {
        if (newPasswordOne === newPasswordTwo) {

            const data = {
                password: newPasswordOne,
                email: email
            }

            await this.#usersRepository.setNewPassword(data);

        } else {
            this.setErrorMessage();
        }
    }

    async #generateCode() {
        const recoveryCode = Math.floor(Math.random() * 90000000) + 10000000;
        const email = this.#loginView.querySelector("#email");

        await this.setRecoveryCode(recoveryCode, email);
    }

    async setRecoveryCode(recoveryCode, email) {
        const data = {
            code: recoveryCode,
            email: email.value
        }

        await this.#usersRepository.sendEmail(data);
        console.log(recoveryCode);
        await this.#usersRepository.setRecoveryCode(data);

    }

    async #checkCode(data) {
        const codeButton = document.querySelector("#btnTwo");
        codeButton.addEventListener("click", async () => {
            await this.#checkCode()
        });
        const mail = this.#loginView.querySelector("#email").value;
        const code = data.code;

    //hier komt dan de recoverycode opgehaald uit de database
        const databaseCode = await this.#usersRepository.getRecoveryCode(mail);
        const givenCode = this.#loginView.querySelector("#psw").value;
        const parsedCode = Number.parseFloat(givenCode);


        //geef code uit database mee
        await this.checkGivenCode(parsedCode, mail, databaseCode);

    }

    async checkGivenCode(parsedCode, mail, code) {
        //hardcode getal wordt meegegeven database code
        if (parsedCode === code) {
            this.#loginView = await super.loadHtmlIntoContent("html_views/resetPassword.html");

            const recoverButton = document.querySelector("#recoveryBtn");
            recoverButton.addEventListener("click", () => {
                this.#validateNewPassword(mail)
            });
        } else {
            this.setErrorMessage()
        }
    }

    setErrorMessage() {
        this.#loginView.querySelector('.message').style.display = "flex";
        this.#loginView.querySelector('.message').style.color = "red";
        this.#loginView.querySelector('.message').innerHTML = "De ingevulde velden komen niet overeen";
    }
}