const firebase = require('firebase');
import { FirebaseConfig } from './FirebaseConfig';

require('firebase/firestore');

export class Firebase {

    constructor() {

        this._config = new FirebaseConfig().config;

        this.init();
    }

    init() {

        if (!window._initializedFirebase) {

            firebase.initializeApp(this._config);

            firebase.firestore();

            window._initializedFirebase = true;
        }
    }

    static db() {
        return firebase.firestore();
    }

    static hd() {
        return firebase.storage();
    }

    initAuth() {
        return new Promise((s, f) => {
            let provider = new firebase.auth.GoogleAuthProvider();

            firebase.auth()
                .signInWithPopup(provider)
                .then(result => {

                    let token = result.credential.accessToken;
                    let user = result.user;

                    s({ user, token });
                })
                .catch(err => { f(err) });
        });
    }
}