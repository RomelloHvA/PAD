/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester & Othaim Iboualaisen
 */

import {Controller} from "./controller.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";

export class StoryboardController extends Controller {
    #storyboardView
    #storyboardRepository

    // const user = (get user id)


    constructor() {
        super();
        this.#setupView();

        this.#storyboardRepository = new storyboardRepository();
    }

    async #setupView() {
        //wait for the html to load
        this.#storyboardView = await super.loadHtmlIntoContent("html_views/storyboard.html")
        await this.loadStories();
    }

    async loadStories() {
        try {
            // get array of all stories
            const data = await this.#storyboardRepository.getAll();

            let template = this.#storyboardView.querySelector('#storyTemp').content;

            console.log(data);

            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {

                    let matchProfile = template.cloneNode(true);
                    let title = data[i].title;
                    let body = data[i].body;
                    let id = data[i].storyID;

                    matchProfile.querySelector(".story").id = id;
                    matchProfile.querySelector("#title").innerHTML = title;
                    matchProfile.querySelector("#body").innerHTML = body;

                    this.#storyboardView.querySelector("#profiles").append(matchProfile);
                }
            } else {
                this.#storyboardView.querySelector(".tableTxt").innerHTML = "Er zijn geen verhalen gevonden.";
            }
        } catch (error) {
            console.log(error);
        }
    }
}