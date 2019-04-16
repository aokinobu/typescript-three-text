import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera, CubeCamera,
  Vector3, Box3, BoxGeometry,
  Color, Fog,
  HemisphereLight, SpotLight, PointLight,
  GridHelper, PlaneGeometry, DoubleSide,
  Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, SmoothShading
} from 'three';
// import {OrbitControls} from 'three-orbit-controls';

// import * as OrbitControls from 'three-orbit-controls';


//import '@polymer/iron-ajax/iron-ajax.js';
//<iron-ajax auto="" url="https://test.sparqlist.glyconavi.org/api/GlycoSample_Disease_List_chart" handle-as="json" last-response="{{diseaseresultdata}}"></iron-ajax>

class ThreeText extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          min-height: 400px;
          line-height: 0;
        }
        canvas {
          width: 100%;
          min-height: 400px;
        }
        button {
          position: absolute;
          top: 20px;
          right: 20px;
          border-radius: 3px;
          border: 1px solid #ccc;
          padding: 5px;
        }
      </style>
      <button on-click="{{__enterFullscreen}}">
        {{fullscreen}}
      </button>
      <canvas></canvas>
    `;
  }
  static get properties() {
    return {
      src: String,

      /**
       * Set the full screen button text
       */
      fullscreen: String,

      /**
       * Set the background color of the scene;
       * Use rgb(), hsl(), or X11 color string
       */
      backgroundcolor: String,

      /**
       * Set the floor plane color;
       * Use rgb(), hsl(), or X11 color string
       */
      floorcolor: String,

      /**
       * Set the color of the model file loaded;
       * Use rgb(), hsl(), or X11 color string
       */
      modelcolor: String,
    };
  }

  constructor() {
    super();

    this._modelLoaded = false;
    this._pauseRender = false;

    this.fullscreen = 'Full Screen';
    this.backgroundcolor = 0xf1f1f1;
    this.floorcolor = 0x666666;
    this.modelcolor = 0xfffe57;
  }
  ready() {
    super.ready();
    console.log("ready");
    console.log(this.shadowRoot);
    this.__initRender();
  }
  handleClick(e) {
    console.log('click');
  }

  _handleAjaxPostError(e) {
    console.log('error: ' + e);
  }

  /**
   * Setup the box grid for the bottom plane
   * @memberof ThreeText
   */
  connectedCallback() {
    super.connectedCallback();

    this._scene = new Scene();
    this._scene.background = new Color(this.backgroundcolor);
    // this._scene.fog = new Fog(this.backgroundcolor);
    this.__setGrid();
    // this.__setLights();
  }

  /**
   * Setup the box grid for the bottom plane
   * @memberof ThreeText
   * @private
   */
  __setGrid() {
var geometry = new BoxGeometry( 1, 1, 1 );
var material = new MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new Mesh( geometry, material );
this._scene.add( cube );
  }

  /**
   * Define our scene lighting
   * @memberof ThreeText
   * @private
   */
  __setLights() {
    const hemiphereLight = new HemisphereLight(0xffffbb, 0x080820, 0.5);
    this._scene.add(hemiphereLight);

    const spotLightFront = new SpotLight(0xffffff, 0.5, 0);
    spotLightFront.position.set(-500, 500, 500);
    this._scene.add(spotLightFront);

    const lightbulb = new PointLight(0xffffff, 0.5, 0);
    lightbulb.position.set(2000, -2000, 2000);
    this._scene.add(lightbulb);
  }

  /**
   * Take the current rendering canvas for our web component and request full
   * screen via the Full Screen API
   * @memberof StlPartViewer
   * @private
   */
  __enterFullscreen() {
    console.log("enterfullscreen");
    const canvas = this.shadowRoot.querySelector('canvas');

    this._pauseRender = false;
    this.__render();

    if (canvas.mozRequestFullScreen) {
      canvas.mozRequestFullScreen();
    }
    else if (canvas.webkitRequestFullScreen) {
      canvas.webkitRequestFullScreen();
    }
    else {
      canvas.requestFullscreen();
    }
  }

  __initRender() {
    const canvas = this.shadowRoot.querySelector('canvas');

    this._renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // this.__setCameraAndRenderDimensions();
    // this.__setControls();

    // this.__initIntersectionObserver();
    // this.__initFullScreenApi();

    // TODO blah, this is dumb, polyfill ResizeObserver and use that
    // window.addEventListener('resize', (e) => {
    //   try {
    //     ShadyDOM.flush();
    //   } catch(e) {
    //     // no shadydom for you
    //   }

    //   this.__setProjectionMatrix(this.offsetWidth, this.offsetHeight);
    // });
  }

  /**
   * Define our single camera and its position
   * @memberof StlPartViewer
   * @private
   */
  __setCameraAndRenderDimensions() {
    // This is for the fullscreen exit; the offset is incorrect when checked
    // immediately, so we just cache it for speed
    // TODO track this on potential element resizing
    this._elementDimensions = {
      'width': this.offsetWidth,
      'height': this.offsetHeight,
    };

    this._camera = new PerspectiveCamera(36,
      this.offsetWidth / this.offsetHeight, 0.1, 1000);
    this._camera.position.set(-350, -100, 100)
    this._camera.up = new Vector3(0, 0, 1);

    this.__setProjectionMatrix(this.offsetWidth, this.offsetHeight);
  }

  /**
   * Set the render size and camera aspect ratio as needed based on display
   * height and width. Important for resize and full screen events (otherwise
   * we'll be blurring and stretched).
   * @param {Number} width
   * @param {Number} height
   * @memberof StlPartViewer
   * @private
   */
  __setProjectionMatrix(width, height) {
    this._renderer.setSize(width, height);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }
  /**
   * Setup of user interface controls
   * @memberof StlPartViewer
   * @private
   */
  __setControls() {
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 1.2;
  }

  /**
   * Render all the things
   * @returns
   * @memberof StlPartViewer
   * @private
   */
  __render() {
    // The render will pause when the intersection observer says it's not in
    // view; we override this for the odd case where the canvas goes full screen
    if (this._pauseRender && !this.__isFullScreenElement()) {
      return;
    }
    // this.__updateReflection();
    requestAnimationFrame(() => this.__render());
    this._renderer.render(this._scene, this._camera);
  }

}

customElements.define('wc-three-text', ThreeText);
