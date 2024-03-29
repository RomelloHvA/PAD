/**
 * Repository responsible for all user data from server - CRUD
 * Make sure all functions are using the async keyword when interacting with network!
 *
 * @author Pim Meijer
 */

import { NetworkManager } from "../framework/utils/networkManager.js";

export class UsersRepository {
    //# is a private field in Javascript
    #route
    #networkManager

    constructor() {
        this.#route = "/users"
        this.#networkManager = new NetworkManager();
    }

    async getAll() {

    }

    /**
     * Async function that sends username and password to network manager which will send it to our back-end to see
     * if a user is found with these credentials
     *
     * POST request, so send data as an object which will be added to the body of the request by the network manager
     * @param username
     * @param password
     * @returns {Promise<user>}
     */
    async login(data) {
        return await this.#networkManager
            .doRequest(`${this.#route}/login`, "POST", data);
    }

    //example endpoint would be: /users/signup
    async signup(data) {
        return await this.#networkManager
            .doRequest(`${this.#route}/signup`, "POST", data);

    }

    async getUserData(id){
        return await this.#networkManager.doRequest(`${this.#route}/getSingleUser?userID=${id}`,"GET");
    }

    async updateUserData(userData){
        return await this.#networkManager.doRequest(`${this.#route}/updateSingleUser`,"PATCH", userData);
    }

    async getUserInfo(id){
        return await this.#networkManager.doRequest(`${this.#route}/getUserInfo?userID=${id}`,"GET");
    }

    async getUserStories(data){
        return await this.#networkManager.doRequest(`${this.#route}/getUserStories`,"POST", data);
    }
}