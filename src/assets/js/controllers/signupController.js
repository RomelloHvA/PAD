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
        const firstname = this.#signupView.querySelector("#firstname").value;
        const lastname  = this.#signupView.querySelector("#lastname").value;
        const phoneNr   = this.#signupView.querySelector("#phoneNr").value;
        const email     = this.#signupView.querySelector("#email").value;
        const psw       = this.#signupView.querySelector("#psw").value;
        const pswRepeat = this.#signupView.querySelector("#pswRepeat").value;

        let data = {
            firstname,
            lastname,
            phoneNr,
            email,
            psw,
            pswRepeat
        }

        try{
            const user = await this.#usersRepository.signup(data);

            //let the session manager know we are logged in by setting the username, never set the password in localstorage
            App.sessionManager.set("username", user.username);
            App.loadController(App.CONTROLLER_WELCOME);
        } catch(error) {
            //if unauthorized error code, show error message to the user
            if(error.code === 401) {
                this.#signupView.querySelector(".error").innerHTML = error.reason
            } else {
                console.error(error);
            }
        }
    }
}