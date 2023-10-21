# Predictive Maintenance in Browser

This React App demonstrates ML Inference for Predictive Maintenance in the Browser using

- [Cloudflare Pages](https://pages.cloudflare.com/) to deliver the React app and model via worldwide Content Delivery Network (CDN)
- [ONNX Runtime Web](https://onnxruntime.ai/) for model inference in the Browser
- [Huggingface](https://huggingface.co/bergum/xtremedistil-l6-h384-go-emotion) for NLP model hosting and training API (Transformer library) 
- [Google Colab](https://colab.research.google.com/) for model training using GPU instances 


# Predictive Maintenance Dataset: (https://www.kaggle.com/datasets/arnabbiswas1/microsoft-azure-predictive-maintenance)
Testing input data are [public/data/pm_data_test_v5_true.csv] and [public/data/pm_data_test_v5_false.csv]

# Model name: 
model_name = 'microsoft/xtremedistil-l6-h384-uncased'


## ONNX-Runtime-web
The model is quantized to `int8` weights and has 22M trainable parameters. 

Inference is multi-threaded. To use
multiple inference threads, specific http headers must be presented by the CDN, see 
[Making your website "cross-origin isolated" using COOP and COEP](https://web.dev/coop-coep/). 

For development, the [src/setupProxy.js](src/setupProxy.js) adds the required headers. 
See [react issue 10210](https://github.com/facebook/create-react-app/issues/10210)

## Code Navigation
- The App frontend logic is in [src/App.js](src/App.js)
- The model inference logic is in [src/inference.js](src/inference.js)
- The tokenizer is in [src/bert_tokenizer.js](src/bert_tokenizer.ts) which is a copy of [Google TFJS](https://raw.githubusercontent.com/tensorflow/tfjs-models/master/qna/src/bert_tokenizer.ts) (Apache 2.0)
- Cloudflare header override for cross-origin coop policy to enable multi threaded inference [public/_header](public/_headers). 

## Model and Language Biases
The pre-trained language model was trained on text with biases, 
see [On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?](https://dl.acm.org/doi/10.1145/3442188.3445922) 
for a study on the dangers of pre-trained language models and transfer learning. 


## Running this app 
Install Node.js/npm, see [Installing Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

In the project directory, you can run: 

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


## TODO 
- Fix build to copy wasm files from node_modules to build to avoid having wasm files under source control.  
- PR and feedback welcome - create an issue to get in contact. 

