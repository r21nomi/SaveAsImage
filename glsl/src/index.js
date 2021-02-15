const vertexShaderSource = require('webpack-glsl-loader!./shader/vertex.vert');
const fragmentShaderSource = require('webpack-glsl-loader!./shader/fragment.frag');

import * as imageCapture from "./imageCapture";

const canvas = document.getElementById("canvas");
const gl = canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});
const startTime = Date.now();
let currentProgram;
let bodyElem;
let mouse = {
    x: 0,
    y: 0
};
let canvasWidth = 0;
let canvasHeight = 0;
let currentTime = 480;

// For image generation
let imageIndex = 0;
let isImageGenerationMode = true;

// Config
const quality = 1;
const duration = 10.0;  // in sec

const animate = () => {
    requestAnimationFrame(animate.bind(this));
    updateCanvas();
};

const updateCanvas = () => {
    if (!gl) {
        console.error('webgl is not available.');
        return;
    }

    if (!currentProgram) {
        let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) {
            // Could not compile program.
            console.error('Could not compile program.');
        }
        currentProgram = createProgram(gl, vertexShader, fragmentShader);
    }

    gl.useProgram(currentProgram);

    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const positions = [
        -1.0,
        -1.0,
        1.0,
        -1.0,
        -1.0,
        1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
        -1.0,
        1.0
    ];

    // position
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    let positionAttributeLocation = gl.getAttribLocation(currentProgram, 'position');
    gl.enableVertexAttribArray(positionAttributeLocation);

    let size = 2;  // xy
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;
    let offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // resolution
    let resolutionLocation = gl.getUniformLocation(currentProgram, 'resolution');
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);

    // time
    if (!isImageGenerationMode) {
        // currentTime = (Date.now() - startTime) / 1000;
    }
    let timeLocation = gl.getUniformLocation(currentProgram, 'time');
    gl.uniform1f(timeLocation, currentTime);

    // duration
    let durationLocation = gl.getUniformLocation(currentProgram, 'duration');
    gl.uniform1f(durationLocation, duration);

    // mouse
    const mouseLocation = gl.getUniformLocation(
        currentProgram,
        "mouse"
    );
    gl.uniform2f(mouseLocation, mouse.x, mouse.y);

    const primitiveType = gl.TRIANGLES;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(primitiveType, 0, positions.length / 2);
};

const createShader = (gl, type, source) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);

        return null;
    }

    return shader;
};

const createProgram = (gl, vertexShader, fragmentShader) => {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getParameterInfoLog(program));
        gl.deleteProgram(program);
        return;
    }
    return program;
};

const getBodyElem = () => {
    if (!bodyElem) {
        bodyElem = document.getElementsByTagName("body")[0];
    }
    return bodyElem;
};

const onResize = () => {
    const width = getBodyElem().clientWidth;
    const height = getBodyElem().clientHeight;

    setSize(width, height);
};

const setSize = (width, height) => {
    canvasWidth = width / quality;
    canvasHeight = height / quality;

    canvas.setAttribute("width", canvasWidth);
    canvas.setAttribute("height", canvasHeight);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
};

const onMousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;
    if (root) {
        const left = rect.top + root.scrollLeft;
        const top = rect.top + root.scrollTop;
        mouse.x = (e.pageX - left) / getBodyElem().clientWidth;
        mouse.y = 1 - (e.pageY - top) / getBodyElem().clientHeight;
    }
}

window.addEventListener("resize", onResize);
window.addEventListener("mousemove", onMousemove);

onResize();
animate();

/**
 * Generate images
 */
const generateImage = () => {
    imageCapture.createImage(canvas, "glsl", imageIndex);
    // setTimeout(() => {
    //     currentTime += 0.01;
    //     imageIndex++;
    //     if (currentTime < duration) {
    //         generateImage();
    //     }
    // }, 100);
};
document.getElementById("generateImageButton")
    .addEventListener("click", () => {
        window.removeEventListener("resize", onResize);
        setSize(4134, 5846);
        isImageGenerationMode = true;
        // currentTime = 0;

        setTimeout(() => {
            generateImage();
        }, 1000);
    });