/**
 * Controller responsible for all events in profile view
 * @author Othaim Iboualaisen
 */

import { UsersRepository } from "../repositories/usersRepository.js";
import { Controller } from "./controller.js";
import {App} from "../app.js";

export class profileController extends Controller{
    //# is a private field in Javascript
    #usersRepository
    #profileView
    #userID

    constructor() {
        super();
        this.#usersRepository = new UsersRepository();
        this.#userID = App.sessionManager.get("userID");

        this.#setupView()
    }

    /**
     * Loads contents of desired HTML file into the index.html .content div
     * @returns {Promise<void>}
     */
    async #setupView() {
        //await for when HTML is loaded, never skip this method call in a controller
        this.#profileView = await super.loadHtmlIntoContent("html_views/profile.html")

        const data = await this.#usersRepository.getUserData(this.#userID);

    }

}