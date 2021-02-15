precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float duration;  // in sec

float rand(float t) {
    return fract(sin(t * 1234.0) * 5678.0);
}

void main(void) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    uv *= 40.0;
    vec2 id = floor(uv);
    vec3 color = vec3(1.0);
    float t = time + 100.0;

    vec3 background = vec3(0.2, 0.1, 0.3);
    vec3 dripColor = vec3(0.7, 0.8, 0.9);
    if (mod(id.x, 2.0) == 0.0) {
        float speed = 3.0;
        float y = uv.y * 0.4 + rand(id.x) * 100.0 + t * rand(id.x) * speed;
        float l = max(mod(-y, 20.0), 0.0) / 15.0;
        color = mix(background, dripColor, l);
    } else {
        color = background;
    }

    gl_FragColor = vec4(color, 1.0);
}