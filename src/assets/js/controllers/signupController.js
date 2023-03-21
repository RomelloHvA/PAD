/**
 * Controller responsible for all events in signup view
 * @author Othaim Iboualaisen
 */

import { UsersRepository } from "../repositories/usersRepository.js";
import { App } from "../app.js";
import { Controller } from "./controller.js";

export class SignupController extends Controller {
    //# is a private field in Javascript
    #usersRepository
    #signupView

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
        this.#signupView = await super.loadHtmlIntoContent("html_views/signup.html")

        //from here we can safely get elements from the view via the right getter
        this.#signupView.querySelector("#btn").addEventListener("click", event => this.#handleLogin(event));
    }
    /**
     * Async function that does a login request via repository
     * @param event
     */
    async #handleLogin(event) {
        //prevent actual submit and page refresh
        event.preventDefault();

        //get the input field elements from the view and retrieve the value
        const firstname = this.#signupView.querySelector("#firstname");
        const lastname  = this.#signupView.querySelector("#lastname");
        const phoneNr   = this.#signupView.querySelector("#phoneNr");
        const email     = this.#signupView.querySelector("#email");
        const psw       = this.#signupView.querySelector("#psw");
        const pswRepeat = this.#signupView.querySelector("#pswRepeat");

        let data = {
            firstname: firstname.value,
            lastname: lastname.value,
            phoneNr: phoneNr.value,
            email: email.value,
            psw: psw.value,
            pswRepeat: pswRepeat.value
        }


        try{
            const signUp = await this.#usersRepository.signup(data);

            console.log(signUp);

            this.#signupView.querySelector('.message').innerText = signUp.message;

            const form = this.#signupView.querySelector('form');
            form.reset();

            //let the session manager know we are logged in by setting the username, never set the password in localstorage
            App.sessionManager.set("userID", signUp.userID);
            // App.loadController(App.CONTROLLER_LOGIN);
        } catch(error) {
            //if unauthorized error code, show error message to the user
            if(error.code === 401) {
                let errorExists = false;

                for (let i = 0; i < error.reason.length; i++) {
                    console.log(error.reason[i]);
                    const fieldId = error.reason[i].field;
                    const inputField = this.#signupView.querySelector(`#${fieldId}`);
                    inputField.classList.toggle("input-error", true);

                    const inputContainer = inputField.parentElement;
                    const small = inputContainer.querySelector('small');
                    small.innerText = error.reason[i].message;

                    errorExists = true;

                    // Listen to input changes and remove input-error class when the input value changes
                    inputField.addEventListener("input", () => {
                        inputField.classList.remove("input-error");
                        small.innerText = "";
                    });
                }
            } else {
                console.error(error);
            }
        }
    }
}

