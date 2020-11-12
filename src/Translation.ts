import { ErrorMessage } from './ErrorMessage';

/**
 * This class enables to translate Tableaunoir in other languages (french for instance)
 */
export class Translation {

    /**
     * initialization
     */
    static init() {
        try {
            Translation.translate();
        }
        catch (e) {
            ErrorMessage.show(e);
        }

    }

    /**
     * @returns the language written in the URL (for instance "fr"), or null if none is provided
     */
    static getLanguage() {
        const params = (new URL(<any>document.location)).searchParams;
        return params.get('lang');
    }


    /**
     * @returns a promise on the dictionnary of the selected language
     */
    static fetchDictionary(): Promise<{}> {
        const language = Translation.getLanguage();

        if (language == null)
            return new Promise(() => { });

        return fetch("src/" + language + ".json")
            .then(txt => txt.json())

    }

    /**
     *
     * @param element HTML element
     * @param dict
     * @description translate the HTML element
     */
    static translateElement(element: Element, dict) {
        if (element.children == undefined)
            return;

        if ((<any>element).title == undefined) {
            if (dict[(<any>element).title])
                (<any>element).title = dict[(<any>element).title];
        }

        if (element.children.length == 0) {
            if (dict[element.innerHTML])
                element.innerHTML = dict[element.innerHTML];
        } else {
            for (const i in element.children)
                Translation.translateElement(element.children[i], dict);

        }
    }



    /**
     *
     * @param dict
     * @description translates the element by the IDs
     */
    static translateFromIDs(dict) {
        for (const key in dict) {
            if (key.startsWith('#')) {
                const element = document.getElementById(key.substr(1));

                if (element == undefined)
                    console.log(`Element ${key} not found. I can translate..`);

                if (element.children.length > 0)
                    console.log("I refuse to translate because the element has some children.");

                element.innerHTML = dict[key];
            }
        }
    }
    /**
     * big translation procedure
     */
    static translate() {
        const dictionnary = Translation.fetchDictionary();
        dictionnary.then(dict => {
            Translation.translateElement(document.getElementById("controls"), dict);
            Translation.translateElement(document.getElementById("menu"), dict);
            Translation.translateFromIDs(dict);


        }
        )
    }
}
