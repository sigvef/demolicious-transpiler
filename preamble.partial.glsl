uniform float iGlobalTime;


int xor(int a, int b) {
    int result = 0;
    for(int i = 0; i < 16; i++) {
        if(mod(float(a), 2.) > .5) {
            if(mod(float(b), 2.) < .5) {
                result += int(pow(2., float(i)));
            }
        }
        else if(mod(float(a), 2.) < .5) {
            if(mod(float(b), 2.) > .5) {
                result += int(pow(2., float(i)));
            }
        }
        a /= 2;
        b /= 2;
    }
    return result;
}

int and(int a, int b) {
    int result = 0;
    for(int i = 0; i < 16; i++) {
        if(mod(float(a), 2.) > .5) {
            if(mod(float(b), 2.) > .5) {
                result += int(pow(2., float(i)));
            }
        }
        a /= 2;
        b /= 2;
    }
    return result;
}

int or(int a, int b) {
    int result = 0;
    for(int i = 0; i < 16; i++) {
        if(mod(float(a), 2.) > .5 || mod(float(b), 2.) > .5) {
            result += int(pow(2., float(i)));
        }
        a /= 2;
        b /= 2;
    }
    return result;
}

vec3 color(int data) {
    vec3 color = vec3(0., 0., 0.);
    color.r = float(and(data, 63488) / int(pow(2., 11.)));
    color.g = float(and(data, 2016) / int(pow(2., 5.)));
    color.b = float(and(data, 31));
    color.r *= pow(2., 3.);
    color.g *= pow(2., 2.);
    color.b *= pow(2., 3.);
    color /= 256.;
    return color;
}

#define sra(a, b) (a / int(pow(2., float(b))))
#define srl(a, b) (a / int(pow(2., float(b))))
#define sll(a, b) (a *   int(pow(2., float(b))))


#define address_lo 4
#define address_hi 3
#define id_hi 1
#define id_lo 2
#define mask 6
#define data 5


void main(void)
{
    
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= 512.;
    uv.y = 256. - uv.y * 256.;
   
    
    int r[16];
    r[0] = 0;
    r[1] = ((int(uv.y) * 512 + int(uv.x)) / 0xFFFF);
    r[2] = and(int(uv.y) * 512 + int(uv.x), 0xFFFF);
    r[3] = 0;
    r[4] = 0;
    r[5] = 0;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = 0;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = int(iGlobalTime * 1000.);
