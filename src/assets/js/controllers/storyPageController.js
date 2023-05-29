/**
 * controller responsible for all events on the storypage view
 * @author  Othaim Iboualaisen
 */

import {Controller} from "./controller.js";
import {App} from "../app.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {storyboardRepository} from "../repositories/storyboardRepository.js";
import {EditStoryController} from "./editStoryController.js";
import {StoryboardController} from "./storyboardController.js";

export class storyPageController extends Controller {
    #storyPageView

    #storyRepository
    #storyboardRepository

    #storyID
    #profileURL
    #storyURL

    #profileID
    #currentUserID
    #isCurrentUser


    constructor() {
        super();
        this.#setupView();

        this.#storyRepository = new storyRepository();
        this.#storyboardRepository = new storyboardRepository();

        const controller = App.getCurrentController();
        if (controller.data) {
            this.#storyID = parseInt(controller.data.storyId);
        }

        this.#profileURL = "#profile?userId=";
        this.#storyURL = "#storyPage?storyId=";

    }

    async #setupView() {
        //wait for the html to load
        this.#storyPageView = await super.loadHtmlIntoContent("html_views/storyPage.html");

        // Fetch Story Data
        const data = await this.#storyRepository.getSingleStory(this.#storyID);

        const storyData = data[0];

        if (data.length > 0) {

            this.#isCurrentUser = this.checkIfCurrentUser(storyData.userID);


            let storyDate;

            if (storyData.day !== null && storyData.month !== null) {
                storyDate = storyData.day.toString().padStart(2, '0') + '/' + storyData.month.toString().padStart(2, '0') + '/' + storyData.year.toString();
            } else {
                storyDate = storyData.year.toString();
            }

            const createdAt = storyData.created_at.toLocaleString();
            const dateOnly = createdAt.split("T")[0];


            const title = this.#storyPageView.querySelector("#title");
            const image = this.#storyPageView.querySelector("#image");
            const profileImg = this.#storyPageView.querySelector("#profileImg");
            const author = this.#storyPageView.querySelector("#author");
            const body = this.#storyPageView.querySelector("#body");
            const post_date = this.#storyPageView.querySelector("#post_date");
            const date = this.#storyPageView.querySelector("#date");

            title.innerHTML = storyData.title;
            image.src = storyData.image || "https://picsum.photos/300/200";
            profileImg.src = storyData.profileImg || "https://bootdey.com/img/Content/avatar/avatar7.png";
            author.innerHTML = storyData.author;
            author.href = this.#profileURL + storyData.userID;
            body.innerHTML = storyData.body;
            post_date.innerHTML = dateOnly;
            date.innerHTML = "Gebeurtenis: " + storyDate;

            await this.toggleButtons();
            this.getEditStory(data);
        }

        const moreUserStories = await this.#storyRepository.getMoreFromUser(storyData.userID, this.#storyID);

        console.log(moreUserStories);

        if (moreUserStories.length > 1) {
            let template = this.#storyPageView.querySelector('#userStory').content;

            for (let i = 0; i < moreUserStories.length; i++) {
                let storyTemp = template.cloneNode(true);

                let storyDate;

                if (moreUserStories[i].day !== null && moreUserStories[i].month !== null) {
                    storyDate = moreUserStories[i].day.toString().padStart(2, '0') + '/' + moreUserStories[i].month.toString().padStart(2, '0') + '/' + moreUserStories[i].year.toString();
                } else {
                    storyDate = moreUserStories[i].year.toString();
                }
                console.log(moreUserStories[i].author)

                storyTemp.querySelector("#title_userStory").innerHTML = moreUserStories[i].title;
                storyTemp.querySelector("#author_userStory").innerHTML = moreUserStories[i].author;
                storyTemp.querySelector("#date_userStory").innerHTML = storyDate;
                storyTemp.querySelector("#image_userStory").src = moreUserStories[i].image;
                storyTemp.querySelector("#link_userStory").href = this.#storyURL + moreUserStories[i].storyID;

                this.#storyPageView.querySelector("#userStories").append(storyTemp);
            }
        } else {
            this.#storyPageView.querySelector("#sameUser").style.display = "none";
        }

        await this.setupTopStories();

    }

    checkIfCurrentUser(storyOwner) {
        this.#profileID = storyOwner;
        if (App.sessionManager.get("userID")) {
            this.#currentUserID = App.sessionManager.get("userID");
        } else {
            return false;
        }

        if (this.#profileID === this.#currentUserID) {
            return true;
        }
        return false
    }

    async toggleButtons() {
        if (!this.#isCurrentUser) {
            this.#storyPageView.querySelector(".editButtons").style.display = 'none';
        }
        if (App.sessionManager.get("userID")) {
            await this.likeStory();
            await this.removeStory();
        } else {
            await this.disableLikes()
            await this.disableRemoveBtn();
        }
    }

    async setupTopStories() {
        const topStories = await this.#storyRepository.getTopThree();
        if (topStories.length > 0) {
            let template = this.#storyPageView.querySelector('#topStory').content;

            for (let i = 0; i < topStories.length; i++) {
                let storyTemp = template.cloneNode(true);

                let storyDate;

                if (topStories[i].day !== null && topStories[i].month !== null) {
                    storyDate = topStories[i].day.toString().padStart(2, '0') + '/' + topStories[i].month.toString().padStart(2, '0') + '/' + topStories[i].year.toString();
                } else {
                    storyDate = topStories[i].year.toString();
                }

                storyTemp.querySelector("#title_topStory").innerHTML = topStories[i].title;
                storyTemp.querySelector("#author_topStory").innerHTML = topStories[i].author;
                storyTemp.querySelector("#date_topStory").innerHTML = storyDate;
                storyTemp.querySelector("#image_topStory").src = topStories[i].image;
                storyTemp.querySelector("#link_topStory").href = this.#storyURL + topStories[i].storyID;

                this.#storyPageView.querySelector("#topStories").append(storyTemp);

            }
        } else {
            this.#storyPageView.querySelector("#mostLiked").style.display = "none";
        }
    }

    /**
     This function allows the user to like or unlike a story based on their current like status for that story.
     If the story has already been liked by the user, the function unlikes it when the like button is clicked.
     If the story has not been liked by the user, the function likes the story when the like button is clicked.
     The function also updates the 'liked' status of the button and the like count accordingly.
     @author Tygo Geervliet
     */
    async likeStory() {
        let likeBtn = this.#storyPageView.querySelector("#like");

        const storyId = this.#storyID;
        let alreadyLiked = await this.#storyboardRepository.checkAlreadyLiked(this.#currentUserID, storyId);

        //get return value from alreadyliked from promise
        let alreadyLikedValue = this.retrieveAlreadyLikedValue(alreadyLiked, this.#currentUserID, storyId);

        let likeCounter = likeBtn.parentElement.querySelector("#counter");

        likeBtn.addEventListener("click", async (event) => {
            if (alreadyLikedValue === 0) {
                likeCounter.textContent = parseInt(likeCounter.textContent) + 1;
                await this.addNewLike(this.#currentUserID, storyId);
                alreadyLikedValue = 1;
                likeBtn.classList.add("liked");
            } else {
                if (parseInt(likeCounter.textContent) > 0) {
                    likeCounter.textContent = parseInt(likeCounter.textContent) - 1;
                }
                this.removeLike(this.#currentUserID, storyId);
                alreadyLikedValue = 0;
                likeBtn.classList.remove("liked");
            }
        });

        if (alreadyLikedValue === 1) {
            likeBtn.classList.add("liked");
        }

    }

    async removeStory() {
        const removeBtn = this.#storyPageView.querySelector("#deleteBtn");
        const storiesFromThisUser = await this.#storyboardRepository.getStoryByUserID(this.#currentUserID);
        this.#updateRemoveButtonsVisibility(removeBtn, storiesFromThisUser);

        const modal = this.#storyPageView.querySelector("#myModal");

        const storyId = this.#storyID;

        removeBtn.addEventListener("click", async (event) => {
            modal.style.display = "block";

            const yesBtn = modal.querySelector("#modal-yes");
            const noBtn = modal.querySelector("#modal-no");

            const deleteStory = async () => {
                await this.#storyboardRepository.removeStory(storyId);
                modal.style.display = "none";
                App.setCurrentController(new StoryboardController())
            };

            yesBtn.addEventListener("click", deleteStory);
            noBtn.addEventListener("click", () => {
                modal.style.display = "none";
            });
        });
    }


    /**
     Disables all like buttons on the storyboard view and changes their style to grey.
     @author Tygo Geervliet
     */
    async disableLikes() {
        const likeBtns = this.#storyPageView.querySelectorAll("#like");
        likeBtns.forEach(btn => {
            btn.className = "ui grey button";
            btn.addEventListener('mouseover', () => {
                btn.style.cursor = 'not-allowed';
            });
        });
    }

    disableRemoveBtn() {
        let removeBtns = this.#storyPageView.querySelectorAll("#deleteBtn");

        for (let btn of removeBtns) {
            btn.disabled = true;
            btn.style.display = "none";
        }
    }

    retrieveAlreadyLikedValue(alreadyLiked, userID, storyId) {
        let alreadyLikedObject = alreadyLiked[0];
        let key = 'AlreadyLiked(' + userID + ',' + storyId + ')';
        return alreadyLikedObject[key];
    }

    async addNewLike(userID, storyID) {
        await this.#storyboardRepository.addLike(userID, storyID);
    }

    async removeLike(userID, storyID) {
        await this.#storyboardRepository.removeLike(userID, storyID);
    }

    /**
     Updates the visibility of the remove buttons.
     @param {NodeList} removeBtns - The collection of remove buttons to update.
     @param {Array} storiesFromThisUser - The stories associated with the current user.
     @returns {void}
     @author Tygo Geervliet && Othaim Iboualaisen
     */
    #updateRemoveButtonsVisibility(btn) {
        // The storyId matches one of the numbers in storiesFromThisUserValue
        btn.style.display = "block"
    }

    getEditStory(story) {
        let editBtn = this.#storyPageView.querySelector("#editBtn");

        editBtn.addEventListener("click", () => {
            for (let i = 0; i < story.length; i++) {
                if (story[i].storyID === this.#storyID) {
                    new EditStoryController(story[i]);
                }
            }
        })
    }
}