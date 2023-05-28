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
        codeButton.addEventListener("click", async () => {await this.#checkCode()
        })
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
        console.log("check code is aangeroepen")

        const emaill = this.#loginView.querySelector("#email").value;
        console.log(emaill + "iehfwi");

       // geef email mee voor de juiste gebruiker
       // console.log(await this.#usersRepository.getRecoveryCode(emaill));

        const juisteTestCode = 79254963;
        const fouteTestCode = 12345678;

        const givenCode = this.#loginView.querySelector("#psw");
        console.log(givenCode + " given code");

        if (givenCode === juisteTestCode){
            console.log("code klopt");

        } else {
            this.setErrorMessage()
            console.log("code klopt niet");

        }
    }

    setErrorMessage() {
        console.log("set errror code is aangeroepen")
        this.#loginView.querySelector('.message').style.display = "flex";
        this.#loginView.querySelector('.message').style.color = "red";
        this.#loginView.querySelector('.message').innerHTML = "De ingevulde velden komen niet overeen";
        this.#loginView.querySelector('#email').style.borderColor = "red";
        this.#loginView.querySelector('#psw').style.borderColor = "red";

    }
}