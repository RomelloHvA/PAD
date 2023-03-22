import { NetworkManager } from "../framework/utils/networkManager.js";

export class storyRepository {
    //# is a private field in Javascript
    #route
    #networkManager

    constructor() {
        this.#route = "/story"
        this.#networkManager = new NetworkManager();
    }

    async getAll() {

    }

    async addNewStory(requestBody) {


        const response = await this.#networkManager.doFileRequest(`${this.#route}/add`, "POST", requestBody, {
            'Content-Type': `multipart/form-data;`
        });

        return response;
    }


    async delete() {

    }

    //example endpoint would be: /users/register
    async register(username, password) {

    }

    async update(id, values = {}) {

    }
}