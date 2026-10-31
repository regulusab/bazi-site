import { viteSingleFile } from 'vite-plugin-singlefile';
export default { base: './', plugins:[viteSingleFile()], build:{ target:['es2017','safari12'], outDir:'dist-single' } };
