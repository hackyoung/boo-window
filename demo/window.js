import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '../boo-window.js';

class Win extends PolymerElement {
  static get template() {
    return html`
      <style>
        boo-window {
          --boo-window-container: {
            @apply --shadow-elevation-16dp;
          }
        }
        [slot=content] {
          min-height: 400px; 
        }
        app-toolbar {
          color: #fff;
          background-color: #4285f4;
        }
      </style>
      <boo-window 
        id="boo" 
        width="80%"
        max-width="500"
        max-height="400"
        no-small-screen
        pos-policy="center">

        <app-toolbar slot="move-trigger">
          hello world
        </app-toolbar>

        <div slot="content">
          <p>
            将鼠标放在四个角落可改变拖动改变大小
          </p>
          <p>
            可用鼠标拖动蓝色区域拖放窗口
          </p>
          <button on-click="toggleWin">关闭</button>
        </div>

      </boo-window>
      <button on-click="toggleWin">开启</button>
    `;
  }

  toggleWin() {
    this.$.boo.opened = !this.$.boo.opened;
  }
}

window.customElements.define('test-boo-window', Win);
