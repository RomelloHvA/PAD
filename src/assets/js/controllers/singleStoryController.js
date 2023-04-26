/**
 * Controller for handling and viewing a single story
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";
import {App} from "../app.js";

export class singleStoryController extends Controller {
    #singleStoryView;
    #storyRepository;
    #storyID;
    #storyData;
    #userRepository;
    #authorData;

    /**
     *
     * @param storyId is the storyID that is stored in the URL through keypair. Keypair is after the "?" in the URL.
     * Then an identifier and after the identifier comes an =. Which will be the value.
     * @author Romello ten Broeke
     */
    constructor(storyId) {
        super();
        this.#storyRepository = new storyRepository();
        this.#userRepository = new UsersRepository();
        this.#storyID = storyId;
        this.#setupView().then();
    }

    /**
     * Sets up the view for a single story page.
     *  * Loads the HTML view into the content area, retrieves story data by ID,
     *  * sets the story year, title, text, and photo, and retrieves the story likes.
     *  * If any error occurs during this process, sets an error state for the story.
     * @returns {Promise<void>} A promise that resolves after the view setup is completed.
     * @author Romello ten Broeke
     */
    async #setupView() {
        this.#singleStoryView = await this.loadHtmlIntoContent("html_views/singleStory.html");
        await this.#getStoryByID();


        try {
            await this.#getUserData(this.#storyData[0].userID);
            this.#setStoryYear(this.#storyData[0].year);
            this.#setStoryAuthor(this.#authorData[0].firstName + " " + this.#authorData[0].lastName);
            this.#setStoryTitle(this.#storyData[0].title);
            this.#setStoryText(this.#storyData[0].body);
            this.#setStoryPhoto(this.#storyData[0].image);
            await this.#setStoryLikes();
        } catch (e) {
            this.#setErrorStory();
        }

        }


    /**
     * Gets the data for the story corresponding to the storyID.
     * @returns {Promise<void>} A promise that resolves after the story data is retrieved.
     * @author Romello ten Broeke
     */
    async #getStoryByID() {
        this.#storyData = await this.#storyRepository.getSingleStory(this.#storyID);
    }

    /**
     * Function for setting the year in the view.
     * @param storyYearData this is the data that will be displayed.
     * @author Romello ten Broeke
     */

    #setStoryYear(storyYearData){
        let year = this.#singleStoryView.querySelector(".year");
        year.innerText = storyYearData;
    }

    /**
     * Function for setting the Title in the view
     * @param storyTitleData this is the title data that will be displayed. Should be a year.
     */
    #setStoryTitle(storyTitleData){
        let storyTitle = this.#singleStoryView.querySelector(".card-title");
        storyTitle.innerText = storyTitleData;
    }

    async #getUserData(userId) {
       this.#authorData = await this.#userRepository.getUserById(userId);
    }

    #setStoryAuthor(storyAuthorData){
        let storyAuthor = this.#singleStoryView.querySelector(".username");
        storyAuthor.innerText = storyAuthorData;
    }

    /**
     * Function for setting the main story Text Data.
     * @param storyTextData this is the text data for the story that will be displayed.
     * @author Romello ten Broeke
     */
    #setStoryText(storyTextData){
        let storyText = this.#singleStoryView.querySelector(".card-body");
        storyText.innerText = storyTextData;
    }

    /**
     * function for giving the right path to the corresponding image of a story.
     * @param photoLocationData this is the src path to the image.
     * @author Romello ten Broeke
     */
    #setStoryPhoto(photoLocationData){
        let storyPhoto = this.#singleStoryView.querySelector(".img-fluid");

        if (this.#storyData[0].image != null){
            storyPhoto.src = photoLocationData;
        } else {
            storyPhoto.src = "assets/img/demo-image-01.jpg";
        }
    }

    /**
     *
     * @returns {Promise<*>} resolves after the likes have been obtained
     * @author Romello ten Broeke
     */
    async #getStoryLikes() {
        return await this.#storyRepository.getUpvoteForStoryId(this.#storyID);
    }

    /**
     *
     * @returns {Promise<void>} resolves after the likes have been set.
     * @author Romello ten Broeke
     */
    async #setStoryLikes(){
        let totalLikes = await this.#getStoryLikes();
    let likeCounter = this.#singleStoryView.querySelector("#counter");
    likeCounter.innerText = totalLikes[0].total_likes;
    }

    /**
     * This is the method for liking a story. Will be implemented at a later time.
     */
    #likeStory(){}

    /**
     * function for that should be called upon when there is an error. Sets an error message for the enduser.
     * @author Romello ten Broeke
     */
    #setErrorStory(){
        let errorTitle = "Error";
        let errorText = "Er is iets misgegaan in het laden van het verhaal. Het verhaal wat u zoekt bestaat niet (meer). Navigeer terug naar de home pagina.";
        this.#setStoryTitle(errorTitle);
        this.#setStoryText(errorText)
    }

}