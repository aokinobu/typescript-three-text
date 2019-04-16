import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera, CubeCamera,
  Vector3, Box3, BoxGeometry,
  Color, Fog,
  HemisphereLight, SpotLight, PointLight,
  GridHelper, PlaneGeometry, DoubleSide,
  Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, SmoothShading,
  FontLoader, TextGeometry, ShapeBufferGeometry, SVGLoader, Group
} from 'three';

// import {OrbitControls} from './orbit-controls';

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
        #info {
    	    position: absolute;
	        top: 10px;
	        width: 100%;
	        text-align: center;
	        z-index: 100;
	        display:block;
        }
      </style>
      <div id="info">Text inside Canvas</div>
      <canvas></canvas>
`;
  }
  static get properties() {
    return {
      selection: {
        notify: true,
        type: String,
        value: function () {
          return new String();
        }
      }
    };
  }
  constructor() {
    super();

    this._modelLoaded = false;
    this._pauseRender = false;
    this._camera = new PerspectiveCamera(125, window.innerWidth / window.innerHeight, 0.5, 500);
    this._camera.position.z = 100;

    this.fullscreen = 'Full Screen';
    this.backgroundcolor = 0xf1f1f1;
    this.floorcolor = 0x666666;
    this.modelcolor = 0xfffe57;
  }

  ready() {
    super.ready();
    console.log("ready");
    console.log(this.shadowRoot);

    this._scene = new Scene();
    this._scene.background = new Color(this.backgroundcolor);
    this._scene.fog = new Fog(this.backgroundcolor);
   
    this.__setGrid();
    this.__initRender();
    this.__render();
  }
  handleClick(e) {
    console.log('click');
  }
  _handleAjaxPostError(e) {
    console.log('error: ' + e);
  }

  /**
 * Fire up the renderer
 */
  __initRender() {
    const canvas = this.shadowRoot.querySelector('canvas');

    this._renderer = new WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    // this.__setCameraAndRenderDimensions();
    // TODO blah, this is dumb, polyfill ResizeObserver and use that
    window.addEventListener('resize', (e) => {
      try {
        ShadyDOM.flush();
      } catch (e) {
        // no shadydom for you
      }
    });
  }

  /**
   * Setup the box grid for the bottom plane
   * @memberof StlPartViewer
   * @private
   */
  __setGrid() {
    // this._gridHelper = new GridHelper(1000, 50, 0xffffff, 0xffffff);
    // this._gridHelper.geometry.rotateX( Math.PI / 2 );
    // this._gridHelper.lookAt(new Vector3(0, 0, 1));
    var geometry = new BoxGeometry(1, 1, 1);
    var material = new MeshBasicMaterial({ color: 0x00ff00 });
    this._cube = new Mesh(geometry, material);
    // this._scene.add(this._cube);
    this._camera.position.z = 100;

    var loader = new FontLoader();
    var self = this;
		loader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

					var xMid, text;

					var color = new Color( 0x006699 );

					var matDark = new MeshBasicMaterial( {
						color: color,
						side: DoubleSide
					} );

					var matLite = new MeshBasicMaterial( {
						color: color,
						transparent: true,
						opacity: 0.4,
						side: DoubleSide
					} );

					var message = "   Three js message.";

					var shapes = font.generateShapes( message, 100 );

					var geometry = new ShapeBufferGeometry( shapes );

					geometry.computeBoundingBox();

					xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

					geometry.translate( xMid, 0, 0 );

					// make shape ( N.B. edge view not visible )

					text = new Mesh( geometry, matLite );
					text.position.z = - 150;
					self._scene.add( text );

					// make line shape ( N.B. edge view remains visible )

					// var holeShapes = [];

					// for ( var i = 0; i < shapes.length; i ++ ) {

					// 	var shape = shapes[ i ];

					// 	if ( shape.holes && shape.holes.length > 0 ) {

					// 		for ( var j = 0; j < shape.holes.length; j ++ ) {

					// 			var hole = shape.holes[ j ];
					// 			holeShapes.push( hole );

					// 		}

					// 	}

					// }

					// shapes.push.apply( shapes, holeShapes );

          // var style = SVGLoader.getStrokeStyle( 5, color.getStyle() );

					// var strokeText = new Group();

					// for ( var i = 0; i < shapes.length; i ++ ) {

					// 	var shape = shapes[ i ];

					// 	var points = shape.getPoints();

					// 	var geometry = SVGLoader.pointsToStroke( points, style );

					// 	geometry.translate( xMid, 0, 0 );

					// 	var strokeMesh = new Mesh( geometry, matDark );
					// 	strokeText.add( strokeMesh );

					// }

					// self._scene.add( strokeText );

				} ); //end load function


    // this._scene.add(this._gridHelper);
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
    this._cube.rotation.x += 0.01;
    this._cube.rotation.y += 0.01;
    // this.__updateReflection();
    requestAnimationFrame(() => this.__render());
    this._renderer.render(this._scene, this._camera);
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

}

window.customElements.define('wc-three-text', ThreeText);