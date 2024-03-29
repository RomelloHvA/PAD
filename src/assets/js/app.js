/**
 * Entry point front end application - there is also an app.js for the backend (server folder)!
 *
 * All methods are static in this class because we only want one instance of this class
 * Available via a static reference(no object): `App.sessionManager.<..>` or `App.networkManager.<..>` or `App.loadController(..)`
 *
 * @author Lennard Fonteijn & Pim Meijer
 */

import { SessionManager } from "./framework/utils/sessionManager.js"
import { LoginController } from "./controllers/loginController.js"
import { NavbarController }  from "./controllers/navbarController.js"
import { UploadController }  from "./controllers/uploadController.js"
import { WelcomeController }  from "./controllers/welcomeController.js"
import { SignupController } from "./controllers/signupController.js";
import { FooterController } from "./controllers/footerController.js";
import {TimelineController} from "./controllers/timelineController.js";
import {addStoryController} from "./controllers/addStoryController.js";
import {StoryboardController} from "./controllers/storyboardController.js";
import {singleStoryController} from "./controllers/singleStoryController.js";
import {myProfileController} from "./controllers/myProfileController.js";
import {editProfileController} from "./controllers/editProfileController.js";
import {profileController} from "./controllers/profileController.js";
import {storyPageController} from "./controllers/storyPageController.js";

export class App {
    //we only need one instance of the sessionManager, thus static use here
    // all classes should use this instance of sessionManager
    static sessionManager = new SessionManager();

    //controller identifiers, add new controllers here
    static CONTROLLER_NAVBAR = "navbar";
    static CONTROLLER_LOGIN = "login";
    static CONTROLLER_LOGOUT = "logout";
    static CONTROLLER_WELCOME = "welcome";
    static CONTROLLER_UPLOAD = "upload";
    static CONTROLLER_SIGNUP = "register";
    static CONTROLLER_FOOTER = "footer";
    static CONTROLLER_TIMELINE = "timeline"
    static CONTROLLER_ADDSTORY = "addStory"
    static CONTROLLER_STORYBOARD = "storyboard";
    static CONTROLLER_SINGLESTORY = "singleStory";
    static CONTROLLER_MYPROFILE = "myProfile";
    static CONTROLLER_PROFILE = "profile";
    static CONTROLLER_EDITPROFILE = "editProfile";
    static CONTROLLER_STORYPAGE = "storyPage";


    constructor(name, controllerData) {
        //Always load the navigation
        App.loadController(App.CONTROLLER_NAVBAR, controllerData);
        App.CONTROLLER_FOOTER = new FooterController();

        //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
        App.loadControllerFromUrl(App.CONTROLLER_WELCOME);
    }

    /**
     * Loads a controller
     * @param name - name of controller - see static attributes for all the controller names
     * @param controllerData - data to pass from on controller to another - default empty object
     * @returns {boolean} - successful controller change
     */
    static loadController(name, controllerData) {
        // console.log("loadController: " + name);

        //log the data if data is being passed via controllers
        if (controllerData && Object.entries(controllerData).length !== 0) {
            console.log(controllerData);
        }

        //Check for a special controller that shouldn't modify the URL
        switch(name) {
            case App.CONTROLLER_NAVBAR:
                new NavbarController();
                return true;

            case App.CONTROLLER_LOGOUT:
                App.handleLogout();
                // new NavbarController();
                return true;
        }

        //Otherwise, load any of the other controllers
        App.setCurrentController(name, controllerData);
        
        switch (name) {
            case App.CONTROLLER_WELCOME:
                App.isLoggedIn(() => new WelcomeController(), () => new WelcomeController());
                break;

            case App.CONTROLLER_LOGIN:
                App.isLoggedIn(() => new WelcomeController(), () => new LoginController());
                break;

            case App.CONTROLLER_SIGNUP:
                App.isLoggedIn(() => new WelcomeController(), () => new SignupController());
                break;
            case App.CONTROLLER_EDITPROFILE:
                App.isLoggedIn(() => new editProfileController(), () => new editProfileController());
                break;
            case App.CONTROLLER_TIMELINE:
                App.setCurrentController(name);
                new TimelineController();
                break;

            case App.CONTROLLER_ADDSTORY:
                App.setCurrentController(name);
                App.isLoggedIn(() => new addStoryController(), () => new LoginController());
                break;

            case App.CONTROLLER_UPLOAD:
                App.isLoggedIn(() => new UploadController(), () => new LoginController());
                break;
            case App.CONTROLLER_STORYBOARD:
                App.isLoggedIn(() => new StoryboardController(), () => new StoryboardController());
                break;
            case App.CONTROLLER_SINGLESTORY:
                /**
                 * Loads new controller and takes the URL data after the "=". storyId is the
                 */
                new singleStoryController(controllerData.storyId);
                break;
            case App.CONTROLLER_MYPROFILE:
                App.isLoggedIn(() => new myProfileController(App.sessionManager.get("userID")), () => new LoginController());
                break;
            case App.CONTROLLER_PROFILE:
                App.isLoggedIn(() => new profileController(), () => new profileController());
                break;
            case App.CONTROLLER_STORYPAGE:
                App.isLoggedIn(() => new storyPageController(), () => new storyPageController());
                break;

            default:
                return false;
        }

        return true;
    }

    /**
     * Alternative way of loading controller by url
     * @param fallbackController
     */
    static loadControllerFromUrl(fallbackController) {
        const currentController = App.getCurrentController();

        if (currentController) {
            if (!App.loadController(currentController.name, currentController.data)) {
                App.loadController(fallbackController);
            }
        } else {
            App.loadController(fallbackController);
        }
    }

    /**
     * Looks at current URL in the browser to get current controller name
     * @returns {string}
     */
    static getCurrentController() {
        const fullPath = location.hash.slice(1);

        if(!fullPath) {
            return undefined;
        }

        const queryStringIndex = fullPath.indexOf("?");
        
        let path;
        let queryString;

        if(queryStringIndex >= 0) {
            path = fullPath.substring(0, queryStringIndex);
            queryString = Object.fromEntries(new URLSearchParams(fullPath.substring(queryStringIndex + 1)));
        }
        else {
            path = fullPath;
            queryString = undefined
        }

        return {
            name: path,
            data: queryString
        };
    }

    /**
     * Sets current controller name in URL of the browser
     * @param name
     */
    static setCurrentController(name, controllerData) {
        if(App.dontSetCurrentController) {
            return;
        }

        if(controllerData) {
            history.pushState(undefined, undefined, `#${name}?${new URLSearchParams(controllerData)}`);    
        }
        else
        {
            history.pushState(undefined, undefined, `#${name}`);
        }
    }

    /**
     * Convenience functions to handle logged-in states
     * @param whenYes - function to execute when user is logged in
     * @param whenNo - function to execute when user is logged in
     */
    static isLoggedIn(whenYes, whenNo) {
        if (App.sessionManager.get("userID")) {
            whenYes();
        } else {
            whenNo();
        }
    }

    /**
     * Removes username via sessionManager and loads the login screen
     */
    static handleLogout() {
        App.sessionManager.remove("userID");

        //go to login screen
        App.loadController(App.CONTROLLER_LOGIN);
        new NavbarController();
    }
    /**
     * Removes username via sessionManager and loads the login screen
     * @author Othaim Iboualaisen
     */
    static loginReload() {
        //go to login screen
        App.loadController(App.CONTROLLER_WELCOME);
        new NavbarController();
    }
}

window.addEventListener("hashchange", function() {
    App.dontSetCurrentController = true;
    App.loadControllerFromUrl(App.CONTROLLER_WELCOME);
    App.dontSetCurrentController = false;
});

//When the DOM is ready, kick off our application.
window.addEventListener("DOMContentLoaded", _ => {
    new App();
});