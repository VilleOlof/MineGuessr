/*
 * This file is part of BlueMap, licensed under the MIT License (MIT).
 *
 * Copyright (c) Blue (Lukas Rieger) <https://bluecolored.de>
 * Copyright (c) contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
import { Marker } from "./markers/Marker";
import { CSS2DObject } from "./util/CSS2DRenderer";
import { animate, htmlToElement } from "./util/Utils";
import { BoxGeometry, MeshBasicMaterial, Mesh, Vector2 } from "three";
import { i18n } from "../i18n";

export class PopupMarker extends Marker {

    constructor(id, appState, events) {
        super(id);

        this.data.type = "popup";
        this.data.label = "Last Map Interaction";
        this.data.listed = false;

        this.appState = appState;
        this.events = events;
        this.visible = false;

        this.elementObject = new CSS2DObject(htmlToElement(`<div id="bm-marker-${this.data.id}" class="bm-marker-${this.data.type}">Test</div>`));
        this.elementObject.position.set(0.5, 1, 0.5);
        this.addEventListener('removed', () => {
            if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
        });

        let cubeGeo = new BoxGeometry(1.01, 1.01, 1.01).translate(0.5, 0.5, 0.5);
        let cubeMaterial = new MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
        this.cube = new Mesh(cubeGeo, cubeMaterial);
        this.cube.onClick = evt => this.onClick(evt);

        this.add(this.elementObject);
        this.add(this.cube);

        this.animation = null;

        this.events.addEventListener('bluemapMapInteraction', this.onMapInteraction);

        window.addEventListener("mousedown", this.removeHandler);
        window.addEventListener("touchstart", this.removeHandler, { passive: true });
        window.addEventListener("keydown", this.removeHandler);
        window.addEventListener("mousewheel", this.removeHandler);
    }

    onClick(event) {
        return true;
    }

    onMapInteraction = evt => {
        return; // NOT NEEDED, HAVE A OWN POI MARKER INSTEAD
    };

    open() {
        if (this.animation) this.animation.cancel();

        this.visible = true;
        this.cube.visible = true;

        let targetOpacity = 1;

        this.element.style.opacity = "0";
        this.animation = animate(progress => {
            this.element.style.opacity = (progress * targetOpacity).toString();
        }, 300);
    }

    removeHandler = evt => {
        if (evt.composedPath().includes(this.element)) return;
        this.close();
    }

    close() {
        if (this.animation) this.animation.cancel();

        this.cube.visible = false;

        let startOpacity = parseFloat(this.element.style.opacity);
        this.animation = animate(progress => {
            this.element.style.opacity = (startOpacity - progress * startOpacity).toString();
        }, 300, finished => {
            if (finished) this.visible = false;
        });
    }

    /**
     * @returns {Element}
     */
    get element() {
        return this.elementObject.element.getElementsByTagName("div")[0];
    }

    dispose() {
        super.dispose();

        if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
    }

}