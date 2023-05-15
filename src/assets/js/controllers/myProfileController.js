/**
 * Controller for handling a logged in user their profile page
 * @author Romello ten Broeke
 */
import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";

export class myProfileController extends Controller {

    #userId;
    #myProfileView;
    #storyData;
    #userData;
    #storyRepository;
    #usersRepository;
    #editStoryUrl;
    #storyTemplate;
    #selectedSortingOrder;
    #sortingASC = "Meest recente post";
    #sortingDES = "Oudste Post";
    #selectMenu;


    constructor(userId) {
        super();
        this.#storyRepository = new storyRepository();
        this.#usersRepository = new UsersRepository();
        this.#userId = userId;
        this.#setupView().then();
    }

    async #setupView() {
        this.#myProfileView = await this.loadHtmlIntoContent("html_views/myProfile.html");
        this.#storyTemplate = await this.#myProfileView.querySelector("#story-template");
        this.#selectMenu = this.#myProfileView.querySelector("#post-select");
        await this.#setUserFields();
        await this.#getAllUserStories();
        this.#selectedSortingOrder = this.#sortingASC;
        //Sorts the stories ascending when loading the page.
        this.#sortStoriesData(this.#selectedSortingOrder, this.#storyData);

        //Sorts the stories depending on the option
        this.#selectMenu.addEventListener("change", async (event) =>{
            const selectValue = event.target.value;
            this.#sortStoriesData(selectValue, this.#storyData);
            console.log(selectValue);
        })




    }

    async #getUserData() {
        this.#userData = await this.#usersRepository.getUserById(this.#userId);
    }

    async #getAllUserStories (){
        this.#storyData = await this.#storyRepository.getAllForUser(this.#userId);
    }

    async #setUserFields() {

        await this.#getUserData();
        let maxLikes = await this.#getTotalLikesForUser();

        this.#setTotalLikesInView(maxLikes[0].total_likes);

        let emailField = this.#myProfileView.querySelector("#user-email");
        let firstNameField = this.#myProfileView.querySelector("#first-name");
        let lastNameField = this.#myProfileView.querySelector("#last-name");
        let phoneNumberField = this.#myProfileView.querySelector("#phone-number");

        emailField.value = this.#userData[0].email;
        firstNameField.value = this.#userData[0].firstName;
        lastNameField.value = this.#userData[0].lastName;
        phoneNumberField.value = this.#userData[0].phoneNr;
    }

    async #getTotalLikesForUser(){
        return await this.#storyRepository.getTotalUpvotesForUser(this.#userId);
    }

    #setTotalLikesInView(totalLikes){
        this.#myProfileView.querySelector("#total-likes").innerText = totalLikes;
    }

    #setStoriesIntoView(storyData) {

        if (storyData){
            this.#showStoriesHeader();
            let storiesContainer = this.#myProfileView.querySelector("#stories-holder");
            let storyTemplate = this.#storyTemplate.content;


            for (let i = 0; i < storyData.length; i++) {
                let usedTemplate = storyTemplate.cloneNode(true);

                let storyId = storyData[i].storyID;
                let storyTitle = storyData[i].title;
                let storyBody = storyData[i].body;
                let storyDay = storyData[i].day;
                let storyMonth = storyData[i].month;
                let storyYear = storyData[i].year;
                let storyDate = storyDay + "-" + storyMonth + "-" + storyYear;

                usedTemplate.querySelector(".card-title").innerText = storyTitle;
                usedTemplate.querySelector(".card-body").innerText = storyBody;
                usedTemplate.querySelector(".year").innerText = storyDate;


                storiesContainer.append(usedTemplate);



            }

        } else {
            this.#showNoStoriesHeader();
        }

    }

    #showStoriesHeader(){
        let noStoriesDiv = this.#myProfileView.querySelector("#no-stories");
        if (noStoriesDiv) {
            noStoriesDiv.parentNode.removeChild(noStoriesDiv);
        }

        this.#myProfileView.querySelector("#stories-header").classList.remove("visually-hidden");
        this.#myProfileView.querySelector("#sorting-menu").classList.remove("visually-hidden")
    }

    #showNoStoriesHeader(){

        let storiesDiv = this.#myProfileView.querySelector("#stories-header");
        let storiesFilter = this.#myProfileView.querySelector("#sorting-menu");

        if (storiesDiv && storiesFilter){
            storiesDiv.parentNode.removeChild(storiesDiv);
            storiesFilter.parentNode.removeChild(storiesFilter);

        }

        this.#myProfileView.querySelector("#no-stories").classList.remove("visually-hidden");
    }

    #sortStoriesData(sortingOrder, stories){

        if (stories.length < 2){
            console.log("not sorted too little stories");
            this.#setStoriesIntoView(stories);
            return 0;
        }

        if (sortingOrder === this.#sortingASC){
            stories.sort(function(a, b) {
                console.log("Sorted stories ASC");
                let firstStoryDate = new Date(a.created_at);
                let secondStoryDate = new Date(b.created_at);
                return secondStoryDate - firstStoryDate;
            })
            console.log("Sorted ASC");
            console.log(stories);
        } else {
            stories.sort(function(a, b) {
                console.log("Sorted stories DES");
                let firstStoryDate = new Date(a.created_at);
                let secondStoryDate = new Date(b.created_at);
                return firstStoryDate - secondStoryDate;
            })
            console.log("Sorted DES");
            console.log(stories);
        }

        this.#setStoriesIntoView(stories);

        }

        #getSelectedSortingOption(){
        let selectedItem = this.#selectMenu.value;
        console.log(selectedItem);
        }





}