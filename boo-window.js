import { PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import { NeonAnimationRunnerBehavior } from '@polymer/neon-animation/neon-animation-runner-behavior.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@polymer/neon-animation/animations/transform-animation.js';
import '@polymer/iron-media-query/iron-media-query.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

const POS_TOP_LEFT = 'top-left';
const POS_TOP = 'top';
const POS_TOP_RIGHT = 'top-right';
const POS_LEFT = 'left';
const POS_CENTER = 'center';
const POS_RIGHT = 'right';
const POS_BOTTOM_LEFT = 'bottom-left';
const POS_BOTTOM = 'bottom';
const POS_BOTTOM_RIGHT = 'bottom-right';

const BaseWindow = mixinBehaviors([NeonAnimationRunnerBehavior], PolymerElement);
/**
 * `boo-window`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class BooWindow extends BaseWindow {
  static get template() {
    return html`
    <style>
      :host {
        position: fixed;
        display: block;
        z-index: 100;
        box-sizing: border-box;
      }
      .wrapper {
        background-color: white;
        @apply --boo-window-container;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }
      .wrapper>div {
        width: 100%;
        height: 100%;
        overflow: auto;
      }
      .wrapper>a {
        position: absolute;
        z-index: 10000;
        background-color: rgba(0, 0, 0, 0);
        display: block;
        width: 10px;
        height: 10px;
      }
      .wrapper>a.tl {
        top: 0px;
        left: 0px;
      }
      .wrapper>a.tl:hover {
        cursor: nw-resize;
      }
      .wrapper>a.tr:hover {
        cursor: ne-resize;
      }
      .wrapper>a.br:hover {
        cursor: se-resize;
      }
      .wrapper>a.bl:hover {
        cursor: sw-resize;
      }
      :host([no-resize]) .wrapper>a.tl:hover,
      :host([no-resize]) .wrapper>a.tr:hover,
      :host([no-resize]) .wrapper>a.br:hover,
      :host([no-resize]) .wrapper>a.bl:hover {
        cursor: default;
      }
      .wrapper>a.tr {
        top: 0px;
        right: 0px;
      }
      .wrapper>a.bl {
        bottom: 0px;
        left: 0px;
      }
      .wrapper>a.br {
        bottom: 0px;
        right: 0px;
      }
      #shadow {
        opacity: 0.4;
        background-color: white;
        top: 0px;
        left: 0px;
        width: 100vw;
        height: 100vh;
        @apply --boo-window-shadow;
        position: fixed;
      }
    </style>
    <div id="shadow"></div>
    <iron-media-query query="(max-width: 767px)" query-matches="{{smallScreen}}"></iron-media-query>
    <div class="wrapper">
      <a class="tl" on-mousedown="_onResizeTriggerMouseDown"></a>
      <a class="tr" on-mousedown="_onResizeTriggerMouseDown"></a>
      <a class="bl" on-mousedown="_onResizeTriggerMouseDown"></a>
      <a class="br" on-mousedown="_onResizeTriggerMouseDown"></a>
      <div>
        <div id="move-trigger" on-mousedown="_onMoveTriggerMouseDown">
          <slot name="move-trigger"></slot>
        </div>
        <div id="content">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
`;
  }

  static get is() { return 'boo-window'; }
  static get properties() {
    return {
      opened: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        notify: true,
        observer: '_openedChanged'
      },
      noShadow: {
        type: Boolean,
        reflectToAttribute: true,
        value: false,
        abserver: '_noShadowChanged'
      },
      noSmallScreen: {
        type: Boolean,
        value: false
      },
      animationConfig: Object,
      autoComputeHeight: {
        type: Boolean,
        value: true
      },
      // 从左上角为坐标原点的坐标系的横坐标
      x: {
        type: Number,
        value: 0,
        reflectToAttribute: true,
        observer: '_update',
        notify: true
      },
      // 从左上角为坐标原点的坐标系的纵坐标
      y: {
        type: Number,
        value: 0,
        reflectToAttribute: true,
        observer: '_update',
        notify: true
      },
      // 窗口高度，包括header-bar
      height: {
        type: String,
        reflectToAttribute: true,
        observer: '_update',
        notify: true
      },
      // 窗口宽度
      width: {
        type: String,
        value: "200",
        reflectToAttribute: true,
        observer: '_update',
        notify: true
      },
      noResize: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      noMove: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      posPolicy: {
        type: String,
        observer: '_posPolicyChanged'
      },
      fixX: {
        type: Number,
        value: 0
      },
      fixY: {
        type: Number,
        value: 0
      },
      _moving: {
        type: Boolean,
        value: false
      },
      _resizing: {
        type: Boolean,
        value: false
      },
      _beginX: Number,
      _beginY: Number,
      _beginCursorX: Number,
      _beginCursorY: Number,
      smallScreen: Number,
      _resizeTrigger: Object,
    };
  }

  center() {
    let rect = this._size();
    return {
      x: (BooWindow.screenWidth - rect.width) / 2 + this.fixX,
      y: (BooWindow.screenHeight - rect.height) / 2 + this.fixY
    };
  }

  topLeft() {
    return {
      x: this.fixX,
      y: this.fixY
    };
  }

  top() {
    let rect = this._size();
    return {
      x: (BooWindow.screenWidth - rect.width) / 2 + this.fixX,
      y: this.fixY
    };
  }

  topRight() {
    let rect = this._size();
    return {
      x: BooWindow.screenWidth - rect.width + this.fixX,
      y: this.fixY
    };
  }

  left() {
    let rect = this._size();
    return {
      x: this.fixX,
      y: (BooWindow.screenHeight - rect.height) / 2 + this.fixY,
    };
  }

  right() {
    let rect = this._size();
    return {
      x: BooWindow.screenWidth - rect.width + this.fixX,
      y: (BooWindow.screenHeight - rect.height) / 2 + this.fixY,
    };
  }

  bottomLeft() {
    let rect = this._size();
    return {
      x: this.fixX,
      y: BooWindow.screenHeight - rect.height + this.fixY,
    };
  }

  bottom() {
    let rect = this._size();
    return {
      x: (BooWindow.screenWidth - rect.width) / 2 + this.fixX,
      y: BooWindow.screenHeight - rect.height + this.fixY,
    };
  }

  bottomRight() {
    let rect = this._size();
    return {
      x: BooWindow.screenWidth - rect.width + this.fixX,
      y: BooWindow.screenHeight - rect.height + this.fixY,
    };
  }

  computeHeight() {
    let trigger = this.shadowRoot.querySelector('#move-trigger');
    let triggerRect = trigger.getBoundingClientRect();
    let content = this.shadowRoot.querySelector('#content');
    let contentRect = content.getBoundingClientRect();

    return triggerRect.height + contentRect.height;
  }

  assignHeight() {
    this.height = this.computeHeight();
    this.update();
  }

  _size() {
    return {
      width: Math.min(this._width(), BooWindow.screenWidth),
      height: Math.min(this._height(), BooWindow.screenHeight)
    };
  }

  _height() {
    if (/px$/.test(this.height)) {
      return parseFloat(this.height);
    }
    if (/vh$/.test(this.height) || /%$/.test(this.height)) {
      return BooWindow.screenHeight * parseFloat(this.height) / 100;
    }
    return this.height;
  }

  _width() {
    if (/px$/.test(this.width)) {
      return parseFloat(this.width);
    }
    if (/vw$/.test(this.width) || /%$/.test(this.width)) {
      return BooWindow.screenWidth * parseFloat(this.width) / 100;
    }
    return this.width;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this._onWindowMouseUp.bind(this));
    window.addEventListener('mousemove', this._onWindowMouseMove.bind(this));
    this.addEventListener('neon-animation-finish', this._onAnimationFinish.bind(this));
    let wrapper = this.shadowRoot.querySelector('.wrapper');
    this.animationConfig = {
      entry: [{
        name: 'fade-in-animation',
        node: this
      }, {
        name: 'transform-animation',
        transformFrom: 'translateY(-20px)',
        transformTo: 'none',
        node: wrapper
      }],
      exit: [{
        name: 'fade-out-animation',
        node: this
      }, {
        name: 'transform-animation',
        transformFrom: 'none',
        transformTo: 'translateY(20px)',
        node: wrapper
      }]
    };
  }

  _onAnimationFinish(e) {
    if (!this.opened) {
      this.style.display = 'none';
      this.dispatchEvent(new CustomEvent('closed'));
      return;
    }
    this.dispatchEvent(new CustomEvent('opened'));
  }

  _noShadowChanged(noShadow) {
    if (!this.opened) {
      return;
    }
    this.$.shadow.style.display = noShadow ? 'none' : 'block';
  }

  _onResizeTriggerMouseDown(e) {
    if (this.noResize) {
      return;
    }
    this._resizing = true;
    this._resizeTrigger = e.target;
    this._beginCursorX = e.screenX;
    this._beginCursorY = e.screenY;
    this._beginHeight = this._height();
    this._beginWidth = this._width();
    this._beginX = this.x;
    this._beginY = this.y;
    let body = document.getElementsByTagName('body')[0];
    body.style.userSelect = 'none';
  }

  _onMoveTriggerMouseDown(e) {
    if (this.noMove) {
      return;
    }
    let moveTrigger = this.shadowRoot.querySelector('#move-trigger');
    this._moving = true;
    this._beginCursorX = e.screenX;
    this._beginCursorY = e.screenY;
    this._beginX = this.x;
    this._beginY = this.y;
    moveTrigger.style.cursor = 'move';
    let body = document.getElementsByTagName('body')[0];
    body.style.userSelect = 'none';
  }

  _onWindowMouseUp(e) {
    let moveTrigger = this.shadowRoot.querySelector('#move-trigger');
    if (this._moving) {
      this._moving = false;
      this.dispatchEvent(new CustomEvent('moved'));
    }
    if (this._resizing) {
      this._resizing = false;
      this.dispatchEvent(new CustomEvent('resized'));
    }
    moveTrigger.style.cursor = 'default';
    let body = document.getElementsByTagName('body')[0];
    body.style.userSelect = 'text';
  }

  _onWindowMouseMove(e) {
    if (this._moving) {
      this.x = this._beginX + e.screenX - this._beginCursorX;
      this.y = this._beginY + e.screenY - this._beginCursorY;
      this.dispatchEvent(new CustomEvent('moving'));
    }
    if (!this._resizing) {
      return;
    }
    let x = e.screenX - this._beginCursorX;
    let y = e.screenY - this._beginCursorY;
    let klass = this._resizeTrigger.getAttribute('class').split(' ');
    if (klass.indexOf('tl') != -1) {
      this.x = this._beginX + x;
      this.y = this._beginY + y;
      this.height = this._beginHeight - y;
      this.width = this._beginWidth - x;
    }
    if (klass.indexOf('tr') != -1) {
      this.y = this._beginY + y;
      this.height = this._beginHeight - y;
      this.width = this._beginWidth + x;
    }
    if (klass.indexOf('bl') != -1) {
      this.x = this._beginX + x;
      this.height = this._beginHeight + y;
      this.width = this._beginWidth - x;
    }
    if(klass.indexOf('br') != -1) {
      this.height = this._beginHeight + y;
      this.width = this._beginWidth + x;
    }
    this.dispatchEvent(new CustomEvent('resizing'));
  }

  _update() {
    if (this.smallScreen && !this.noSmallScreen) {
      this.style.left = '0px';
      this.style.top = '0px';
      this.height = BooWindow.screenHeight;
      this.width = BooWindow.screenWidth;
      this.style.height = BooWindow.screenHeight + 'px';
      this.style.width = BooWindow.screenWidth + 'px';
      this.dispatchEvent(new CustomEvent('update'));
      return;
    }
    this.style.left = this.x + 'px';
    this.style.top = this.y + 'px';
    this.style.height = Math.min(this._height(), BooWindow.screenHeight) + 'px';
    this.style.width = Math.min(this._width(), BooWindow.screenWidth) + 'px';
    this.dispatchEvent(new CustomEvent('update'));
  }

  update() {
    this._posPolicyChanged(this.posPolicy);
  }

  _posPolicyChanged(policy) {
    let pos = { x: this.fixX, y: this.fixY };
    switch(policy) {
      case POS_TOP_LEFT:
        pos = this.topLeft();
        break;
      case POS_TOP_RIGHT:
        pos = this.topRight();
        break;
      case POS_TOP:
        pos = this.top();
        break;
      case POS_LEFT:
        pos = this.left();
        break;
      case POS_CENTER:
        pos = this.center();
        break;
      case POS_RIGHT:
        pos = this.right();
        break;
      case POS_BOTTOM_LEFT:
        pos = this.bottomLeft();
        break;
      case POS_BOTTOM:
        pos = this.bottom();
        break;
      case POS_BOTTOM_RIGHT:
        pos = this.bottomRight();
        break;
    }
    this.x = pos.x;
    this.y = pos.y;
  }

  _openedChanged(opened, old) {
    this.$.shadow.style.display = opened && !this.noShadow ? 'block' : 'none';
    if (opened) {
      this.style.display = 'block';
      if (this.autoComputeHeight) {
        this.height = this.computeHeight();
        this.update();
      }
      this.playAnimation('entry');
      return;
    }
    if (old === undefined) {
      this.style.display = 'none';
      return;
    }
    this.playAnimation('exit');
  }

  static get screenWidth() {
    if (document.documentElement.clientWidth) {
      return document.documentElement.clientWidth;
    }
    return document.body.clientWidth;
  }

  static get screenHeight() {
    if (document.documentElement.clientHeight) {
      return document.documentElement.clientHeight;
    }
    return document.body.clientHeight;
  }
}

window.customElements.define(BooWindow.is, BooWindow);
