/**
 * controller responsible for all events on the storyboard view
 * @author  Rosalinde Vester & Othaim Iboualaisen
 */

import {Controller} from "./controller.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {App} from "../app.js";

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



            if (data.length > 0) {
                for (let i = 0; i < data.length; i++) {

                    let matchProfile = template.cloneNode(true);
                    let id = data[i].storyID;
                    let title = data[i].title;
                    let body = data[i].body

                    matchProfile.querySelector(".story").id = id;
                    matchProfile.querySelector("#title").innerHTML = title;
                    matchProfile.querySelector("#body").innerHTML = body;

                    this.#storyboardView.querySelector("#stories").append(matchProfile);
                }
            } else {
                this.#storyboardView.querySelector(".message").innerHTML = "Er zijn geen verhalen gevonden.";
                this.#storyboardView.querySelector(".message").style.display = "block";
            }
        } catch (error) {
            console.log(error);
        }

        if (App.sessionManager.get("userID")) {
            await this.likeStory()
        } else {
            await this.disableLikes()
        }

    }
    async disableLikes() {
        const likeBtns = this.#storyboardView.querySelectorAll("#like");
        likeBtns.forEach(btn => {
            btn.className = "ui grey button";
        });
    }


    async likeStory() {

        let userID = App.sessionManager.get("userID");

        let likeBtn = this.#storyboardView.querySelectorAll("#like");

        // Check if the user has already liked each story
        likeBtn.forEach(btn => {
            let storyId = parseInt(btn.parentElement.parentElement.parentElement.id);

            let alreadyLiked = this.#storyboardRepository.checkAlreadyLiked(userID, storyId);;
            //set already liked 'true' or 'false'
            if(alreadyLiked === 1) {
                alreadyLiked = true;
            }
            else {
                alreadyLiked = false;
            }

            //like counter
            let likeCounter = btn.parentElement.querySelector("#counter");


            btn.addEventListener("click", event => {
                //if story is not already liked current user
                if (!alreadyLiked) {

                    // User hasn't liked this story yet, so add the like
                    likeCounter.textContent = parseInt(likeCounter.textContent) + 1;

                    this.addNewLike(userID, storyId);

                    // Update the 'alreadyLiked' flag
                    alreadyLiked = true;

                    // Set the 'liked' class on the like button
                    btn.classList.add("liked");
                } else {
                    // User has already liked this story, so remove the like
                    if (parseInt(likeCounter.textContent) > 0) {
                        likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
                    }

                    this.removeLike(userID, storyId);
                    // Update the 'alreadyLiked' flag
                    alreadyLiked = false;

                    // Remove the 'liked' class from the like button
                    btn.classList.remove("liked");
                }
            });

            // Set the initial state of the like button
            if (alreadyLiked) {
                btn.classList.add("liked");
            }
        });
    }

    async addNewLike(userID, storyID) {

        await this.#storyboardRepository.addLike(userID, storyID);

    }

    async removeLike(userID, storyID) {

        await this.#storyboardRepository.removeLike(userID, storyID);

    }



}