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

        const mailButton = document.querySelector("#btn");
        mailButton.addEventListener("click",() => {this.#generateCode()});

        const codeButton = document.querySelector("#btnTwo");
        codeButton.addEventListener("click", () => {this.#checkCode()})
    }

    async #generateCode(){
        //geneer de code
        const recoveryCode = Math.floor(Math.random() * 90000000) + 10000000;
        const email = this.#loginView.querySelector("#email");

        const data = {
            code: recoveryCode,
            email: email.value
        }
        //stuur de code naar de database
        //stuurt later ook de mail
        console.log(recoveryCode)
        await this.#usersRepository.setRecoveryCode(data);
    }

    async #checkCode(){

        const emaill = this.#loginView.querySelector("#email").value;
        console.log(emaill + "iehfwi");

       // geef email mee voor de juiste gebruiker
       console.log(await this.#usersRepository.getRecoveryCode(emaill));
    }
}