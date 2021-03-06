import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { ActionFreeDraw } from './ActionFreeDraw';
import { Drawing } from "./Drawing";
import { getCanvas } from "./main";
import { ToolDraw } from "./ToolDraw";

export class TestPerformance {

    static init(): void {
        window["TestPerformance"] = TestPerformance;
    }

    static testSVG(): void {
        for (let x = 0; x < 500; x += 4)
            for (let y = 0; y < 1000; y += 4) {
                const svgLine = ToolDraw.addSVGLine(x, y, x + 2, y + 1, 0.5, "yellow");
                document.getElementById("svg").appendChild(svgLine);
            }

    }

    static testCanvas(): void {
        for (let x = 0; x < 500; x += 4)
            for (let y = 0; y < 1000; y += 4) {
                Drawing.drawLine(getCanvas().getContext("2d"), x, y, x + 2, y + 1, 0.5, "yellow");
            }

    }




    static testBigCanvas(): void {
        const w = 20000;
        const h = 1000;
        const S = 16;
        let nbObject = 0;
        getCanvas().width = w;
        for (let x = 0; x < w; x += S) {
            for (let y = 0; y < h; y += S) {
                const action = new ActionFreeDraw(UserManager.me.userID);
                action.addPoint({ x: x, y: y, pressure: 1, color: randomColor() });
                action.addPoint({ x: x + S * Math.random(), y: y + S * Math.random(), pressure: 1, color: randomColor() });
                action.redo();
                BoardManager.addAction(action);
                nbObject++;
            }
        }
        console.log(nbObject + " objects");

    }

    static testBigCanvasSVG(): void {
        const w = 20000;
        const h = 1000;
        const S = 16;
        let nbObject = 0;
        getCanvas().width = w;
        for (let x = 0; x < w; x += S) {
            for (let y = 0; y < h; y += S) {
                const svgLine = ToolDraw.addSVGLine(x, y, x + S * Math.random(), y + S * Math.random(), 1, randomColor());
                document.getElementById("svg").appendChild(svgLine);
                nbObject++;
            }
        }
        console.log(nbObject + " objects");

    }


    static _testCanvas(w: number, S: number): void {
        const h = 1000;
        let nbObject = 0;
        getCanvas().width = w;
        for (let x = 0; x < w; x += S) {
            for (let y = 0; y < h; y += S) {
                const action = new ActionFreeDraw(UserManager.me.userID);
                action.addPoint({ x: x, y: y, pressure: 1, color: randomColor() });
                action.addPoint({ x: x + S * Math.random(), y: y + S * Math.random(), pressure: 1, color: randomColor() });
                action.redo();
                BoardManager.addAction(action);
                nbObject++;
            }
        }
        console.log(nbObject + " objects");

    }


    static _testSVG(w: number, S: number): void {
        const h = 1000;
        let nbObject = 0;
        getCanvas().width = w;
        for (let x = 0; x < w; x += S) {
            for (let y = 0; y < h; y += S) {
                const svgLine = ToolDraw.addSVGLine(x, y, x + S * Math.random(), y + S * Math.random(), 1, randomColor());
                document.getElementById("svg").appendChild(svgLine);
                nbObject++;
            }
        }
        console.log(nbObject + " objects");

    }


    static testNormal(): void {
        TestPerformance._testCanvas(3000, 16);
    }

    static testNormalSVG(): void {
        TestPerformance._testSVG(3000, 16);
    }
}



function randomColor(): string {
    if (Math.random() < 0.2)
        return "orange";
    if (Math.random() < 0.2)
        return "blue";
    return "white";
}