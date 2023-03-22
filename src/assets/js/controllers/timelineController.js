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
    constructor() {
        super();
        this.#currentScrollYear = new Date().getFullYear();
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

    async #LoadStory() {
        let currentScrollYear = this.#currentScrollYear;
        const minScrollYear = this.#MIN_SCROLL_YEAR;
        let storyPerYear = this.#storyRepository;
        let nextStoryPosition = "left";
        let view = this.#createTimelineView;
        let dataIndex = 0;

        //Checks if there is a scrollbar if not, adds stories until there is.
        do {
            await addAndSetStory();
        } while (view.scrollHeight < window.outerHeight)

        async function addAndSetStory() {
            addStory();
            await setStoryContent();
            currentScrollYear--;
        }

        window.addEventListener("scroll", async function () {


            /**
             * Math.ceil is used because the scrollposition when adding more stories gets a decimal number.
             * Because of this the scroll position will never get higher than the scrollheight. So Math.ceil is used to
             * round up and reach the maximum height so new content can be loaded.
             * @type {number}
             */
            const scrollPosition = Math.ceil(window.scrollY + window.innerHeight);

            if (scrollPosition >= view.scrollHeight && currentScrollYear >= minScrollYear) {

                addAndSetStory();
            }


        })

        /**
         * This functions adds the story to the html and determines which position the next story needs to get.
         * @author Romello ten Broeke
         */

        function addStory() {
            const templateRight = view.querySelector("#template-right").content.cloneNode(true);

            const templateLeft = view.querySelector("#template-left").content.cloneNode(true);

            let usedTemplate = setTemplatePosition(nextStoryPosition, templateLeft, templateRight);

            usedTemplate.querySelector(".year").innerText = currentScrollYear;

            view.querySelector(".main-timeline").appendChild(usedTemplate);
            nextStoryPosition = setNextStoryPosition(nextStoryPosition);
        }


        /**
         *
         * @param nextStoryPosition is the value of the where the story is supposed to be relative to the timeline.
         * @param templateLeft is the left positioned  template. Stored in the header
         * @param templateRight is the right positioned template. Stored in the header
         * @returns a template in the correct position.
         */

        function setTemplatePosition(nextStoryPosition, templateLeft, templateRight) {

            if (nextStoryPosition === "left") {
                return templateLeft;
            } else {
                return templateRight
            }

        }

        async function setStoryContent() {
            const noStoryMessageBody = "Helaas is er over deze periode nog geen verhaal bekend " +
                "of er zijn niet genoeg verhalen. Met uw hulp kunnen wij nog meer verhalen toevoegen.";
            const noStoryTitle = "Helaas geen verhaal";

            let data = await storyPerYear.getHighestStoryPerYear(currentScrollYear);
            let storyBody = "";
            let storyTitle = "";

            if (data[dataIndex] === undefined) {
                storyBody = noStoryMessageBody;
                storyTitle =  noStoryTitle;
            } else {
                storyBody = data[dataIndex].body;
                storyTitle = data[dataIndex].title;
                dataIndex++;

            }
            const cardBodies = view.querySelectorAll(".card-body");
            const lastCardBody = cardBodies[cardBodies.length - 1];
            const cardTitles = view.querySelectorAll(".card-title")
            const lastCardTitle = cardTitles[cardTitles.length - 1];

            lastCardTitle.innerText = storyTitle;
            lastCardBody.innerText = storyBody;


        }

        function setNextStoryPosition(nextStoryPosition) {
            if (nextStoryPosition === "left") {
                return "right";
            } else {
                return "left";
            }
        }
    }


}