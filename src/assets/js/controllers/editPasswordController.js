import {Controller} from "./controller.js";
import {storyRepository} from "../repositories/storyRepository.js";
import {UsersRepository} from "../repositories/usersRepository.js";
import {App} from "../app.js";

export class EditPasswordController extends Controller{
    #loginView
    #storyRepository;
    #usersRepository;

    constructor() {
        super();
        this.#storyRepository = new storyRepository();
        this.#usersRepository = new UsersRepository();
        this.#setupView();
    }

    async #setupView() {

        this.#loginView = await super.loadHtmlIntoContent("html_views/editPassword.html");

        const email = this.#loginView.querySelector("#email");

        const sendBtn = document.querySelector("#btn");
        sendBtn.addEventListener("click",() => {this.#generateCode(email)});
    }

    async #generateCode(){
        //geneer de code
        const recoveryCode = Math.floor(Math.random() * 90000000) + 10000000;
        const email = this.#loginView.querySelector("#email");
        const data = {
            code: recoveryCode,
            email: email.value
        }
        // console.log(data.email.value + "email")
        //stuur de code naar de database
        //stuurt later ook de mail
        console.log(recoveryCode)
        await this.#usersRepository.setRecoveryCode(data);

    }
}