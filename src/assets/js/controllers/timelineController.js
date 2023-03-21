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

        //Checks if there is a scrollbar if not, adds stories until there is.
        while (document.scrollingElement.scrollHeight < window.outerHeight){
            addStory();
        }

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
                console.log("Einde bereikt");
            }


        })

        /**
         * This functions adds the story to the html and determines which position the next story needs to get.
         * @author Romello ten Broeke
         */

        function addStory() {
            const templateRight = document.querySelector("#template-right");
            const templateRightClone = templateRight.content.cloneNode(true);

            const templateLeft = document.querySelector("#template-left");
            const templateLeftClone = templateLeft.content.cloneNode(true);

            let usedTemplate = setTemplate(nextStoryPosition, templateLeftClone, templateRightClone);
            console.log(setStoryContent(usedTemplate, currentScrollYear));


            document.querySelector(".main-timeline").appendChild(usedTemplate);
            nextStoryPosition = setStoryPosition(nextStoryPosition);
        }

        /**
         *
         * @param nextStoryPosition is the value of the where the story is supposed to be relative to the timeline.
         * @param templateLeft is the left positioned  template. Stored in the header
         * @param templateRight is the right positioned template. Stored in the header
         * @returns a template in the correct position.
         */

        function setTemplate(nextStoryPosition, templateLeft, templateRight) {

            if (nextStoryPosition === "left") {
                return templateLeft;
            } else {
                return templateRight
            }

        }

        async function setStoryContent(usedTemplate, scrollYear) {
            //The data is always empty?
            console.log(scrollYear + "scrollyear");
            return await storyPerYear.getHighestStoryPerYear(scrollYear);

        }

        function setStoryPosition(nextStoryPosition) {
            if (nextStoryPosition === "left") {
                return "right";
            } else {
                return "left";
            }
        }
    }


}