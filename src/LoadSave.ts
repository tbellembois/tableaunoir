import { ActionSerialized } from './ActionSerialized';
import { Share } from './share';
import { ConstraintDrawing } from './ConstraintDrawing';
import { Layout } from './Layout';
import { CircularMenu } from './CircularMenu';
import { getCanvas } from './main';
import { MagnetManager } from './magnetManager';
import { BoardManager } from './boardManager';
import { Menu } from './Menu'
import html2canvas from 'html2canvas'

/**
 * this class contains the code for loading/saving a tableaunoir. Also for importing images as magnets.
 */
export class LoadSave {

    /**
     * @description initialize the button Save and the drag and drop of files
     */
    static init(): void {
        /**
         * load a file from the <input type="file"...>
         */
        (<HTMLInputElement>document.getElementById("file")).onchange = function () {
            LoadSave.loadFile((<HTMLInputElement>this).files[0]);
        };



        document.getElementById("save").onclick = LoadSave.save;
        document.getElementById("exportPng").onclick = LoadSave.exportPng;
        document.getElementById("buttonCancelStackFlatten").onclick = () => Share.execute("cancelStackFlatten", []);



        document.body.ondragover = (event) => {
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();
        }
        document.body.ondrop = (event) => {
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();

            if (event.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (let i = 0; i < event.dataTransfer.items.length; i++) {
                    // If dropped items aren't files, reject them
                    if (event.dataTransfer.items[i].kind === 'file') {
                        const file = event.dataTransfer.items[i].getAsFile();
                        LoadSave.loadFile(file);
                    }
                }
            } else {
                // Use DataTransfer interface to access the file(s)
                for (let i = 0; i < event.dataTransfer.files.length; i++) {
                    const file = event.dataTransfer.items[i].getAsFile();
                    LoadSave.loadFile(file[i]);
                }
            }

        };
    }

    /**
     *
     * @param {File} file
     * @description load the file file
     */
    static loadFile(file: File): void {
        if (file) {
            const reader = new FileReader();
            reader.onerror = () => {
                //TODO: handle error
            };

            /** load a .tableaunoir file, that is, a file containing the blackboard + some magnets */
            if (file.name.endsWith(".tableaunoir")) {
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    const s: string = <string>evt.target.result;
                    Share.execute("loadBoard", [s]);
                }
            }
            else {
                /** load an image and add it as a magnet */
                reader.readAsDataURL(file);
                reader.onload = function (evt) {
                    const img = new Image();
                    img.src = <string>evt.target.result;
                    MagnetManager.addMagnet(img);
                }
            }

            Menu.hide(); //hide the menu after loading
        }
    }



    /**
     *
     * @param file
     * @param callback
     * @descrption load the image in the file, once the file is loaded. Call the callback function.
     */
    static fetchImageFromFile(file: File, callback: (img: HTMLImageElement) => void): void {
        const reader = new FileReader();
        reader.onerror = function () {
            //TODO: handle error
        }
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            const img = new Image();
            img.src = <string>evt.target.result;
            img.onload = () => callback(img);
        }
    }

    /**
         *
         * @param file
         * @param callback
         * @descrption load the image in the file, once the file is loaded. Call the callback function.
         */
    static fetchFromFile(file: File, callback: (string) => void): void {
        const reader = new FileReader();
        reader.onerror = function () {
            //TODO: error
        }
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            callback(<string>evt.target.result);
        }
    }


    /**
     *
     * @param {*} obj
     * @description load the JSON object of a .tableaunoir file:
     * obj.canvasDataURL is the content of the canvas
     * obj.magnets is the HTML code of the magnets
     */
    static loadJSON(obj: { canvasDataURL?: string, actions: ActionSerialized[], t: number, width: number, height: number, magnets: string, svg: string }): void {
        console.log("loadJSON");

        if (obj.width) {
            getCanvas().width = obj.width;
            getCanvas().height = obj.height;
        }

        if (obj.canvasDataURL) {
            console.log("canvas format!");
            BoardManager.load(obj.canvasDataURL);
        }
            

        if (obj.actions)
            BoardManager.cancelStack.load(obj.actions, obj.t);

        document.getElementById("magnets").innerHTML = obj.magnets;
        document.getElementById("svg").innerHTML = obj.svg;
        ConstraintDrawing.reset();
        MagnetManager.installMagnets();
    }


    /**
     * @description export the board as a .png image file
     */
    static exportPng(): void {
        CircularMenu.hideAndRemove();
        const nodeContent = document.getElementById("content");
        Layout.setForExportPng();
        html2canvas(nodeContent).then(canvas => {
            LoadSave.downloadDataURL((<HTMLInputElement>document.getElementById("exportPngName")).value + ".png", canvas.toDataURL());
        });
        Layout.restoreForUse();
    }


    /**
     * @description save the blackboard and the magnets
     */
    static save(): void {
        const magnets = document.getElementById("magnets").innerHTML;
        const svg = document.getElementById("svg").innerHTML;
        // const canvasDataURL = getCanvas().toDataURL();
        //const obj = { magnets: magnets, svg: svg, canvasDataURL: canvasDataURL };
        const obj = { magnets: magnets, width: getCanvas().width, height: getCanvas().height, svg: svg, actions: BoardManager.cancelStack.serialize(), t: BoardManager.cancelStack.t };
        LoadSave.download((<HTMLInputElement>document.getElementById("name")).value + ".tableaunoir", JSON.stringify(obj));
    }

    /**
     *
     * @param {*} filename
     * @param {*} text
     * @description propose to download a file called filename that contains the text text
     */
    static download(filename: string, text: string): void {
        LoadSave.downloadDataURL(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))

    }



    /**
 *
 * @param {*} filename
 * @param {*} dataURL
 * @description propose to download a file with the content
 */
    static downloadDataURL(filename: string, dataURL: string): void {
        const element = document.createElement('a');
        element.setAttribute('href', dataURL);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

}
