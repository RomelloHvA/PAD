/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester
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
        const response = await this.#storyboardRepository.getAll();
        //haal div box op waar je verhalen moeten komen te staan
        const placeStories = document.querySelector(".templatePlacementBox")
        const storys = [
            {
                title: "soup",
                // body: "soups",
            }
        ];
        for (const data of storys) {
            this.displayStory(data, placeStories)
        }
    }

    displayStory(data, targetElement) {

        //clone template element
        const storyElement = this.#storyboardView.querySelector("template").cloneNode(true);

        console.log(data);
        console.log(data.title);

        //initialize classes with data from the database
        let htmlTitle = document.querySelector("#storyTitleSpan")
        htmlTitle.innerHTML = data.title;

        const storyConst = document.querySelector(".storyBox")
        // storyConst.innerHTML = data.body

        const picture = document.querySelector(".pictureBox")
        // picture.src = data.image;

        targetElement.append(storyElement);


    }
}