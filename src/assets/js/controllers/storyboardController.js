/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester & Othaim Iboualaisen
 */

import {Controller} from "./controller.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {EditStoryController} from "./editStoryController.js";

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

    async loadStories() {
        try {
            // get array of all stories
            const data = await this.#storyboardRepository.getAll();

            let template = this.#storyboardView.querySelector('#storyTemp').content;

            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {
                    let HTMLTemplate = template.cloneNode(true);
                    let id = data[i].storyID;
                    let title = data[i].title;
                    let body = data[i].body;
                    let up = data[i].upvote;
                    let down = data[i].downvote;
                    let reputation = up - down;

                    HTMLTemplate.querySelector(".story").id = id;
                    HTMLTemplate.querySelector("#title").innerHTML = title;
                    HTMLTemplate.querySelector("#body").innerHTML = body;
                    HTMLTemplate.querySelector("#counter").innerHTML = reputation;

                    this.#storyboardView.querySelector("#stories").append(HTMLTemplate);
                    this.#storyboardView.querySelector("#stories").lastChild.previousSibling.addEventListener(
                        "click", ()=>{ new EditStoryController(data[i])
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