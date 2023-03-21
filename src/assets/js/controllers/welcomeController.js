/**
 * Responsible for handling the actions happening on welcome view
 * For now it uses the roomExampleRepository to get some example data from server
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

import {RoomsExampleRepository} from "../repositories/roomsExampleRepository.js";
import {App} from "../app.js";
import {Controller} from "./controller.js";

export class WelcomeController extends Controller{
    #roomExampleRepository
    #welcomeView

    constructor() {
        super();
        this.#roomExampleRepository = new RoomsExampleRepository();

        this.#setupView();
    }

    /**
     * Loads contents of desired HTML file into the index.html .content div
     * @returns {Promise<>}
     * @private
     */
    async #setupView() {
        //await for when HTML is loaded
        this.#welcomeView = await super.loadHtmlIntoContent("html_views/welcome.html")

        const anchors = this.#welcomeView.querySelectorAll("a");
        anchors.forEach(anchor => anchor.addEventListener("click", (event) => this.#handleClickTimelineButton(event)))

    }

    #handleClickTimelineButton(event) {
        event.preventDefault();

        //Get the data-controller from the clicked element (this)
        const clickedAnchor = event.target;
        const controller = clickedAnchor.dataset.controller;

        if(typeof controller === "undefined") {
            console.error("No data-controller attribute defined in anchor HTML tag, don't know which controller to load!")
            return false;
        }

        //TODO: You should add highlighting of correct anchor when page is active :)

        //Pass the action to a new function for further processing
        App.loadController(controller);

        //Return false to prevent reloading the page
        return false;
    }
}