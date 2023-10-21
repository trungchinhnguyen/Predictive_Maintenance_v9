/** */
/*global BigInt */
/*global BigInt64Array */

import { loadTokenizer } from './bert_tokenizer.ts';
import * as wasmFeatureDetect from 'wasm-feature-detect';

//Setup onnxruntime 
const ort = require('onnxruntime-web');

//requires Cross-Origin-*-policy headers https://web.dev/coop-coep/
/**
const simdResolver = wasmFeatureDetect.simd().then(simdSupported => {
    console.log("simd is supported? "+ simdSupported);
    if (simdSupported) {
      ort.env.wasm.numThreads = 3; 
      ort.env.wasm.simd = true;
    } else {
      ort.env.wasm.numThreads = 1; 
      ort.env.wasm.simd = false;
    }
});
*/

const options = {
  executionProviders: ['wasm'], 
  graphOptimizationLevel: 'all'
};

var downLoadingModel = true;
const model = "./classifier_2_int8.onnx";

const session = ort.InferenceSession.create(model, options);
session.then(t => { 
  downLoadingModel = false;
  //warmup the VM
  for(var i = 0; i < 10; i++) {
    console.log("Inference warmup " + i);
    lm_inference("this is a warmup inference");
  }
});

const tokenizer = loadTokenizer()

const STATUS_DEFAULT_DISPLAY = [
  ["Status", "Score"],
  ['false: normal system next step 👍',0],
  ['ttrue: fail system next step 👎',0],
];

const STATUS = [
  'false: normal system next step 👍',
  'true: fail system next step 👎'
];

function isDownloading() {
  return downLoadingModel;
}

function sortResult(a, b) {
  if (a[1] === b[1]) {
      return 0;
  }
  else {
      return (a[1] < b[1]) ? 1 : -1;
  }
}

function sigmoid(t) {
  return 1/(1+Math.pow(Math.E, -t));
}

function create_model_input(encoded) {
  var input_ids = new Array(encoded.length+2);
  var attention_mask = new Array(encoded.length+2);
  var token_type_ids = new Array(encoded.length+2);
  input_ids[0] = BigInt(101);
  attention_mask[0] = BigInt(1);
  token_type_ids[0] = BigInt(0);
  var i = 0;
  for(; i < encoded.length; i++) { 
    input_ids[i+1] = BigInt(encoded[i]);
    attention_mask[i+1] = BigInt(1);
    token_type_ids[i+1] = BigInt(0);
  }
  input_ids[i+1] = BigInt(102);
  attention_mask[i+1] = BigInt(1);
  token_type_ids[i+1] = BigInt(0);
  const sequence_length = input_ids.length;
  input_ids = new ort.Tensor('int64', BigInt64Array.from(input_ids), [1,sequence_length]);
  attention_mask = new ort.Tensor('int64', BigInt64Array.from(attention_mask), [1,sequence_length]);
  token_type_ids = new ort.Tensor('int64', BigInt64Array.from(token_type_ids), [1,sequence_length]);
  return {
    input_ids: input_ids,
    attention_mask: attention_mask,
    token_type_ids:token_type_ids
  }
}

async function lm_inference(text) {
  try { 
    const encoded_ids = await tokenizer.then(t => {
      return t.tokenize(text); 
    });
    if(encoded_ids.length === 0) {
      return [0.0, STATUS_DEFAULT_DISPLAY];
    }
    const start = performance.now();
    const model_input = create_model_input(encoded_ids);
    const output =  await session.then(s => { return s.run(model_input,['output_0'])});
    const duration = (performance.now() - start).toFixed(1);
    const probs = output['output_0'].data.map(sigmoid).map( t => Math.floor(t*100));
    
    const result = [];
    for(var i = 0; i < STATUS.length;i++) {
      const t = [STATUS[i], probs[i]];
      result[i] = t;
    }
    result.sort(sortResult); 
    
    const result_list = [];
    result_list[0] = ["Status", "Score"];
    for(i = 0; i < 2; i++) {
       result_list[i+1] = result[i];
    }
    return [duration,result_list];    
  } catch (e) {
    return [0.0,STATUS_DEFAULT_DISPLAY];
  }
}    

export let inference = lm_inference 
export let columnNames = STATUS_DEFAULT_DISPLAY
export let modelDownloadInProgress = isDownloading
