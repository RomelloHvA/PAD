/**
 * Controller responsible for all events in signup view
 * @author Othaim Iboualaisen
 */

import {UsersRepository} from "../repositories/usersRepository.js";
import {App} from "../app.js";
import {Controller} from "./controller.js";

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

        // const checkbox = this.#signupView.querySelector("#cb1");
        const button = this.#signupView.querySelector("#btn");

        // Disable the button when the page first loads
        button.disabled = false;

        // Listen to changes on the checkbox
        // Disable the button if the checkbox is unchecked
        // checkbox.addEventListener("change", function () {
        //     button.disabled = !this.checked;
        // });

        // Listen to clicks on the button
        // Call the handleLogin method if the button is not disabled (i.e., the checkbox has been checked)
        button.addEventListener("click", event => {
            if (!button.disabled) {
                this.#handleSignup(event);
            }
        });
    }

    /**
     * Async function that does a login request via repository
     * @param event
     */
    async #handleSignup(event) {
        // prevent actual submit and page refresh & get data from html form
        event.preventDefault();
        let data = this.getFormData();

        try {
            const signUp = await this.#usersRepository.signup(data);

            this.setSuccesMessage(signUp.message);

            const form = this.#signupView.querySelector('form');
            form.reset();

            // Redirect to log in screen
            App.loadController(App.CONTROLLER_LOGIN);

        } catch (error) {
            // if unauthorized error code, show error message to the user
            if (error.code === 401) {
                this.handleError(error);
            } else {
                console.error(error);
            }
        }
    }

    setSuccesMessage(message) {
        this.#signupView.querySelector('.message').style.display = "flex";
        this.#signupView.querySelector('.message').style.color = "green";
        this.#signupView.querySelector('.message').innerHTML = message;
    }

    handleError(error) {
        let errorExists = false;

        for (let i = 0; i < error.reason.length; i++) {
            const fieldId = error.reason[i].field;
            const inputField = this.#signupView.querySelector(`#${fieldId}`);
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
        const firstname = this.#signupView.querySelector("#firstname");
        const lastname = this.#signupView.querySelector("#lastname");
        const phoneNr = this.#signupView.querySelector("#phoneNr");
        const email = this.#signupView.querySelector("#email");
        const psw = this.#signupView.querySelector("#psw");
        const pswRepeat = this.#signupView.querySelector("#pswRepeat");

        let data = {
            firstname: firstname.value,
            lastname: lastname.value,
            phoneNr: phoneNr.value,
            email: email.value,
            psw: psw.value,
            pswRepeat: pswRepeat.value
        }
        return data;
    }
}

