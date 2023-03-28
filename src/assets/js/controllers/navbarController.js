/**
 * Responsible for handling the actions happening on the navigation
 *
 * @author Othaim Iboualaisen
 */

import { App } from "../app.js";
import {Controller} from "./controller.js";

export class NavbarController extends Controller{
    #navbarView

    constructor() {
        super();
        this.#setupView();
    }

    /**
     * Loads contents of desired HTML file into the index.html .navigation div
     * @returns {Promise<void>}
     * @private
     */
    async #setupView() {
        //await for when HTML is

        // await this.#isLoggedIn("html_views/navbar_loggedIn.html", "html_views/navbar.html");

        this.#navbarView = await super.loadHtmlIntoNavigation("html_views/navbar.html");

        //from here we can safely get elements from the view via the right getter
        const anchors = this.#navbarView.querySelectorAll("a.nav-link");

        //set click listener on each anchor
        anchors.forEach(anchor => anchor.addEventListener("click", (event) => this.#handleClickNavigationItem(event)))
    }

    // async #isLoggedIn(whenYes, whenNo) {
    //     if (App.sessionManager.get("userID")) {
    //         this.#navbarView = super.loadHtmlIntoNavigation(whenYes);
    //     } else {
    //         this.#navbarView = super.loadHtmlIntoNavigation(whenNo);
    //     }
    // }

    /**
     * Reads data attribute on each .nav-link and then when clicked navigates to specific controller
     * @param event - clicked anchor event
     * @returns {boolean} - to prevent reloading
     * @private
     */
    #handleClickNavigationItem(event) {
        event.preventDefault();
        
        //Get the data-controller from the clicked element (this)
        const clickedAnchor = event.target;
        const controller = clickedAnchor.dataset.controller;

        if(typeof controller === "undefined") {
            console.error("No data-controller attribute defined in anchor HTML tag, don't know which controller to load!")
            return false;
        }

        // Add 'active' class to clicked anchor element
        // const navLinks = document.querySelectorAll('.nav-link');
        // navLinks.forEach(link => {
        //     link.classList.remove('active');
        // });
        // clickedAnchor.classList.add('active');

        //Pass the action to a new function for further processing
        App.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }
}
