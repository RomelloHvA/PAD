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
                    let id = data[i].storyID;
                    let title = data[i].title;
                    let body = data[i].body;
                    let up = data[i].upvote;
                    let down = data[i].downvote;
                    let reputation = up - down;

                    matchProfile.querySelector(".story").id = id;
                    matchProfile.querySelector("#title").innerHTML = title;
                    matchProfile.querySelector("#body").innerHTML = body;
                    matchProfile.querySelector("#counter").innerHTML = reputation;

                    this.#storyboardView.querySelector("#stories").append(matchProfile);
                }
            } else {
                this.#storyboardView.querySelector(".message").innerHTML = "Er zijn geen verhalen gevonden.";
                this.#storyboardView.querySelector(".message").style.display = "block";
            }
        } catch (error) {
            console.log(error);
        }

        await this.likeStory();
    }

    async likeStory() {

        let likeBtn = this.#storyboardView.querySelectorAll("#like");
        likeBtn.forEach(btn => {
            btn.addEventListener("click", event => {
                let likeCounter = btn.parentElement.querySelector("#counter");
                likeCounter.textContent = parseInt(likeCounter.textContent) + 1;
            });
        })
    }



}