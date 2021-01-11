var PADDING = 8;

var rect;
var viewport = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0
}



let getPropertyValue = function(style, prop) {
  let value = style.getPropertyValue(prop);
  value = value ? value.replace(/[^0-9.]/g, '') : '0';
  return parseFloat(value);
}

let getElementRect = function(element) {
  let style = window.getComputedStyle(element, null);
  var x = getPropertyValue(style, 'left')
  var y = getPropertyValue(style, 'top')
  var width = getPropertyValue(style, 'width')
  var height = getPropertyValue(style, 'height')
  
  return {
    x,
    y,
    width,
    height
  }
}

class Resizer {
    constructor(wrapper, element) {
        this.wrapper = wrapper;
        this.element = element;
        this.offsetX = 0;
        this.offsetY = 0;
        this.handle = document.createElement('div');
        this.handle.setAttribute('class', 'drag-resize-handlers');
        this.handle.setAttribute('data-direction', 'br');
        this.wrapper.appendChild(this.handle);
        this.wrapper.style.top = this.element.style.top;
        this.wrapper.style.left = this.element.style.left;
        this.wrapper.style.width = this.element.style.width;
        this.wrapper.style.height = this.element.style.height;
        this.element.style.position = 'relative';
        this.element.style.top = 0;
        this.element.style.left = 0;
        this.onResize = this.resizeHandler.bind(this);
        this.onStop = this.stopResize.bind(this);
        this.handle.addEventListener('mousedown', this.initResize.bind(this));
    }

    initResize(event) {
        this.stopResize(event, true);
        this.handle.addEventListener('mousemove', this.onResize);
        this.handle.addEventListener('mouseup', this.onStop);
    }

    resizeHandler(event) {
        this.offsetX = event.clientX - (this.wrapper.offsetLeft + this.handle.offsetLeft);
        this.offsetY = event.clientY - (this.wrapper.offsetTop + this.handle.offsetTop);
        let wrapperRect = getElementRect(this.wrapper);
        let elementRect = getElementRect(this.element);
        this.wrapper.style.width = (wrapperRect.width + this.offsetX) + 'px';
        this.wrapper.style.height = (wrapperRect.height + this.offsetY) + 'px';
        this.element.style.width = (elementRect.width + this.offsetX) + 'px';
        this.element.style.height = (elementRect.height + this.offsetY) + 'px';
    }

    stopResize(event, nocb) {
        this.handle.removeEventListener('mousemove', this.onResize); 
        this.handle.removeEventListener('mouseup', this.onStop);
    }
}

class Dragger {
    constructor(wrapper, element) {
        this.wrapper = wrapper;
        this.element = element;
        this.element.draggable = true;
        this.element.setAttribute('draggable', true);
        this.element.addEventListener('dragstart', this.dragStart.bind(this));
    }

    dragStart(event) {
        let wrapperRect = getElementRect(this.wrapper);
        var x = wrapperRect.x - parseFloat(event.clientX);
        var y = wrapperRect.y - parseFloat(event.clientY);
        event.dataTransfer.setData("text/plain", this.element.id + ',' + x + ',' + y);
    }

    dragStop(event, prevX, prevY) {
        // store the current viewport and element dimensions when a drag starts
        viewport.bottom = window.innerHeight - PADDING;
        viewport.left = PADDING;
        viewport.right = window.innerWidth - PADDING;
        viewport.top = PADDING;

        let wrapperRect = getElementRect(this.wrapper);
        var height = wrapperRect.height
        var width = wrapperRect.width
        var newLeft = parseFloat(event.clientX) + prevX;
        var newTop = parseFloat(event.clientY) + prevY;
        var newRight = newLeft + width
        var newBottom = newTop + height


        // Deal with Left and Right boundary
        // If either out of bounds
        if (newLeft < viewport.left || newRight > viewport.right
        ) {
            // If left is out of bounds
            if (newLeft < viewport.left){
              this.wrapper.style.left = viewport.left + 'px';
            }
            // If right is out of bounds
            if (newRight > viewport.right){
              this.wrapper.style.left = viewport.right - width + 'px';
            }

        } else {
          //If neither right or left is out of bounds
          this.wrapper.style.left = newLeft + 'px'; 
        }



        // Deal with Top and Bottom boundary
        // If either out of bounds
        if (newTop < viewport.top || newBottom > viewport.bottom
        ) {
            // If top is out of bounds
            if (newTop < viewport.top){
              this.wrapper.style.top = viewport.top + 'px';
            }
            // If bottom is out of bounds
            if (newBottom > viewport.bottom){
              this.wrapper.style.top = viewport.bottom - height + 'px';
            }

        } else {
          //If neither right or left is out of bounds
          this.wrapper.style.top = newTop + 'px'; 
        }
    
    }
}

class DragResize {
    constructor(element) {
        console.log(element)
        this.wrapper = document.createElement('div');
        this.wrapper.setAttribute('class', 'tooltip drag-resize');
        if (element.parentNode) {
          element.parentNode.insertBefore(this.wrapper, element);
          this.wrapper.appendChild(element);
          element.resizer = new Resizer(this.wrapper, element);
          element.dragger = new Dragger(this.wrapper, element);
      }
    }

}

document.body.addEventListener('dragover', function (event) {
    event.preventDefault();
    return false;
});

document.body.addEventListener('drop', function (event) {
    event.preventDefault();
    var dropData = event.dataTransfer.getData("text/plain").split(',');

    var element = document.getElementById(dropData[0]);
    element.dragger.dragStop(event, parseFloat(dropData[1]), parseFloat(dropData[2]));
    return false;
});

console.log(document.getElementById('content1'))
new DragResize(document.getElementById('content1'))

// new DragResize(document.getElementById('content2'))
