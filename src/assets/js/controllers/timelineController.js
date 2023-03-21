/**
 * Controller for handling the timeline.
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";

export class TimelineController extends Controller {
    #createTimelineView;
    #storyRepository;
    #currentScrollYear;
    #MIN_SCROLL_YEAR = 1970;
    #MAX_SCROLL_YEAR = new Date().getFullYear();
    #DEFAULT_STORY_NUMBER_ON_PAGE = 2;
    constructor() {
        super();
        this.#currentScrollYear = this.#MAX_SCROLL_YEAR - this.#DEFAULT_STORY_NUMBER_ON_PAGE;
        this.#storyRepository = new storyRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createTimelineView = await super.loadHtmlIntoContent(
            "html_views/timeline.html");
        // await this.#storyRepository.getHighestStoryPerYear(this.#currentScrollYear)
        this.#LoadStory();

    }

    /**
     * Loads new stories when the user reaches the end of the page by scrolling
     * @author Romello ten Broeke
     */

    #LoadStory(){

        let nextStoryPosition = "left";

        window.addEventListener("scroll", function () {

            console.log(document.body.scrollHeight + "scrollheight");

            /**
             * Math.ceil is used because the scrollposition when adding more stories gets a decimal number.
             * Because of this the scroll position will never get higher than the scrollheight. So Math.ceil is used to
             * round up and reach the maximum height so new content can be loaded.
             * @type {number}
             */
            const scrollPosition = Math.ceil(window.scrollY + window.innerHeight);
            console.log(window.scrollY + window.innerHeight);


                if ( scrollPosition >= document.body.scrollHeight){

                    const templateRight = document.querySelector("#template-right");
                    const templateRightClone = templateRight.content.cloneNode(true);

                    const templateLeft = document.querySelector("#template-left");
                    const templateLeftClone = templateLeft.content.cloneNode(true);


                    document.querySelector(".main-timeline").appendChild(setTemplate(nextStoryPosition,templateLeftClone,templateRightClone));
                    nextStoryPosition = setStoryPosition(nextStoryPosition);
                    console.log("Einde bereikt");
                }



            function setStoryPosition(nextStoryPosition){
                if (nextStoryPosition === "left"){
                    return "right";
                } else {
                    return "left";
                }
            }

            function setTemplate(nextStoryPosition,templateLeft, templateRight) {

                if (nextStoryPosition === "left"){
                    return templateLeft;
                } else {
                    return templateRight
                }

            }

        });

        }


}