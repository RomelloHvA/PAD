import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";
import {App} from "../app.js";

export class EditPasswordController extends Controller{
    #loginView
    #storyRepository;
    #userRepository;

    constructor() {
        super();
        this.#storyRepository = new storyRepository();
        this.#userRepository = new UsersRepository();
        this.#setupView();
    }

    async #setupView() {

        this.#loginView = await super.loadHtmlIntoContent("html_views/editPassword.html");

        const sendBtn = document.querySelector("#btn");
        sendBtn.addEventListener("click",() => {this.#userRepository.getEmail()});
    }
}