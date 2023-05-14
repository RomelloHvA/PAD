/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester & Othaim Iboualaisen
 */

import {Controller} from "./controller.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {EditStoryController} from "./editStoryController.js";
import {App} from "../app.js";

export class StoryboardController extends Controller {
    #storyboardView
    #storyboardRepository

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

    /**
     * this method gets all the story data, clones a template with this info and places in div.
     * @returns {Promise<void>}
     */
    async loadStories() {
        try {
            // get array of all stories
            const data = await this.#storyboardRepository.getAll();
            const sessionID = App.sessionManager.get("userID");

            let template = this.#storyboardView.querySelector('#storyTemp').content;

            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let HTMLTemplate = template.cloneNode(true);
                    let storyId = data[i].storyID;
                    let userId = data[i].userID;
                    let title = data[i].title;
                    let body = data[i].body;
                    let up = data[i].upvote;
                    let down = data[i].downvote;
                    let reputation = up - down;

                        if (userId === sessionID) {
                            HTMLTemplate.querySelector(".editButtons").style.visibility = 'inherit';
                        }

                    HTMLTemplate.querySelector(".story").id = storyId;
                    HTMLTemplate.querySelector("#title").innerHTML = title;
                    HTMLTemplate.querySelector("#body").innerHTML = body;
                    HTMLTemplate.querySelector("#counter").innerHTML = reputation;

                    this.#storyboardView.querySelector("#stories").append(HTMLTemplate);
                    this.#storyboardView.querySelector("#stories").lastChild.previousSibling.querySelector(
                        ".icon-pencil").addEventListener("click", () => {
                        new EditStoryController(data[i])
                    })
                }
            } else {
                this.#storyboardView.querySelector(".message").innerHTML = "Er zijn geen verhalen gevonden.";
                this.#storyboardView.querySelector(".message").style.display = "block";
            }
        } catch (error) {
            console.log(error);
        }
    }

}