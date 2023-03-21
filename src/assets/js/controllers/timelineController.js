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
        this.#currentScrollYear = 2023;
        // this.#MAX_SCROLL_YEAR - this.#DEFAULT_STORY_NUMBER_ON_PAGE;
        this.#storyRepository = new storyRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createTimelineView = await super.loadHtmlIntoContent(
            "html_views/timeline.html");
        this.#LoadStory();

    }

    /**
     * Loads new stories when the user reaches the end of the page by scrolling
     * @author Romello ten Broeke
     */

    #LoadStory() {
        let currentScrollYear = this.#currentScrollYear;
        const minScrollYear = this.#MIN_SCROLL_YEAR;
        let storyPerYear = this.#storyRepository;
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
                // console.log(window.scrollY + window.innerHeight);


                if (scrollPosition >= document.body.scrollHeight && currentScrollYear >= minScrollYear) {

                    addStory();
                    currentScrollYear--;
                    // console.log(currentScrollYear);
                    // console.log(minScrollYear);
                    console.log("Einde bereikt");
                }

                function addStory() {
                    const templateRight = document.querySelector("#template-right");
                    const templateRightClone = templateRight.content.cloneNode(true);

                    const templateLeft = document.querySelector("#template-left");
                    const templateLeftClone = templateLeft.content.cloneNode(true);

                    let usedTemplate = setTemplate(nextStoryPosition, templateLeftClone, templateRightClone);
                    setStoryContent(usedTemplate, currentScrollYear);


                    document.querySelector(".main-timeline").appendChild(usedTemplate);
                    nextStoryPosition = setStoryPosition(nextStoryPosition);
                }

                async function setStoryContent(usedTemplate, scrollYear) {
                    //The data is always empty?
                    console.log(scrollYear +"scrollyear");
                   const data = await storyPerYear.getHighestStoryPerYear(scrollYear);
                    console.log(data);

                }

                function setStoryPosition(nextStoryPosition) {
                    if (nextStoryPosition === "left") {
                        return "right";
                    } else {
                        return "left";
                    }
                }

                function setTemplate(nextStoryPosition, templateLeft, templateRight) {

                    if (nextStoryPosition === "left") {
                        return templateLeft;
                    } else {
                        return templateRight
                    }

                }

            });
        }



}