import {resolve} from 'path';
export default { base: './', build: { target: ['es2017','safari12'], rollupOptions:{input:{main:resolve('index.html'),global:resolve('global.html')}} }, preview: { allowedHosts: true }, server: { allowedHosts: true } };
