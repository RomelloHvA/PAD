/**
 * Controller responsible for all events in login view
 * @author Pim Meijer
 */

import { UsersRepository } from "../repositories/usersRepository.js";
import { App } from "../app.js";
import { Controller } from "./controller.js";

export class LoginController extends Controller{
    //# is a private field in Javascript
    #usersRepository
    #loginView

    constructor() {
        super();
        this.#usersRepository = new UsersRepository();

        this.#setupView()
    }

    /**
     * Loads contents of desired HTML file into the index.html .content div
     * @returns {Promise<void>}
     */
    async #setupView() {
        //await for when HTML is loaded, never skip this method call in a controller
        this.#loginView = await super.loadHtmlIntoContent("html_views/login.html")

        //from here we can safely get elements from the view via the right getter
        const button = this.#loginView.querySelector(".btn");
        button.addEventListener("click", event => this.#handleLogin(event));
    }
    /**
     * Async function that does a login request via repository
     * @param event
     */
    async #handleLogin(event) {
        //prevent actual submit and page refresh
        event.preventDefault();
        let data = this.getFormData();

        try{
            const user = await this.#usersRepository.login(data);

            //let the session manager know we are logged in by setting the username, never set the password in localstorage
            App.sessionManager.set("userID", user.id);
            App.loadController(App.CONTROLLER_WELCOME);

        } catch(error) {
            // if unauthorized error code, show error message to the user
            if (error.code === 401) {
                this.handleError(error);
            } else if (error.code === 429) {
                this.setErrorMessage(error.reason);
            } else {
                console.error(error);
            }
        }
    }

    setErrorMessage(message) {
        this.#loginView.querySelector('.message').style.display = "flex";
        this.#loginView.querySelector('.message').style.color = "red";
        this.#loginView.querySelector('.message').innerHTML = message;
    }

    handleError(error) {
        let errorExists = false;

        for (let i = 0; i < error.reason.length; i++) {
            const fieldId = error.reason[i].field;
            const inputField = this.#loginView.querySelector(`#${fieldId}`);
            inputField.classList.toggle("input-error", true);
            errorExists = true;

            this.displayError(inputField, error.reason[i].message);
        }
    }

    displayError(inputField, message) {
        const inputContainer = inputField.parentElement;
        const small = inputContainer.querySelector('small');
        small.innerText = message;


        // Listen to input changes and remove input-error class when the input value changes
        inputField.addEventListener("input", () => {
            inputField.classList.remove("input-error");
            small.innerText = "";
        });
    }

    getFormData() {
        //get the input field elements from the view and retrieve the value
        const email = this.#loginView.querySelector("#email").value;
        const psw = this.#loginView.querySelector("#psw").value;

        let data = {
            email: email.value,
            psw: psw.value
        }
        return data;
    }
}