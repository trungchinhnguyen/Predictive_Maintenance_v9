import './App.css';
import './App.scss';

import axios from 'axios';
import React from 'react';
import { Component } from 'react';
import { useState } from 'react';

import {inference} from './inference.js';
import {columnNames} from './inference.js';
import {modelDownloadInProgress} from './inference.js';
import Chart from "react-google-charts";
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import ReactFileReader from 'react-file-reader';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      data:columnNames,
      latency:0.0,
      downloading:modelDownloadInProgress(),
      selectedFile: null,
    };

  }

  componentDidMount() {

    this.timerID = setInterval(
      () => this.checkModelStatus(),
      1000
    );
  }

  checkModelStatus() {
    this.setState({
      downloading: modelDownloadInProgress(),
    });
    if (!this.state.downloading) {
      this.timerID = setInterval(
        () => this.checkModelStatus,
        5000000
      );
    }
  }


  onFileChange =event => {
    this.setState({ selectedFile: event.target.files[0] });
          const file = event.target.files[0]; 
          let reader = new FileReader();
          reader.onload = function(event) {
            const file = event.target.result;
            console.log(file);
            console.log(file.name);
          };

          reader.onerror = (e) => alert(e.target.error.name);
          reader.readAsText(file); 

  }


  onFileUpload=() => {

    axios.post('https://predictivemaintenancev20.onrender.com/upload', {file: (this.state.selectedFile, this.state.selectedFile.name)}
          )
          .then((res) => {
            console.log(res);
            })
            .catch((err) => {
                console.error(err)
            })
        let reader = new FileReader();

        reader.onload = () => {

          const lines = reader.result.split("\n");
          const headers = lines[0].split(',');
          const currentLine = lines[1].split(',');
          const textline = [];

          for (let j = 0; j < headers.length; j++) {
            if (j==0) {
              textline[j] = (headers[j] + ' ' + currentLine[j] + '\n');
            } 
            else {
              textline[j] = (textline[j-1]+ headers[j] + ' ' + currentLine[j] + '\n');
            }
          }

          this.setState({
            text: textline[headers.length-1]
          })

          inference(textline[headers.length-1]).then( result => {
            this.setState({
              text : this.state.text,
              data:result[1],
              latency:result[0],
            });
          })

        };
        reader.readAsText(this.state.selectedFile);

     };


  render() {

    return (
      <div className="App">

      <header className="App-header">   
      <em>Precdictive Maintenance: Transformer Inference</em>
      <div><font size="2">If predictive result is true, based on uploading data, please check the components to prevent the system's failure in next step</font></div>
      <Chart  
        width={'400px'}
        height={'200px'}
        chartType="BarChart"
        data={this.state.data}
        options={{
          chartArea: { width: '40%'},
          colors: ['yellow'],
          backgroundColor: '#282c34',
          legend: { 
            textStyle: {color: 'white', fontSize: 10},
            labels: {fontColor:'white'}
          },
          vAxis: {
            textStyle: {
            color: 'white',
            fontSize: 13
          }
          },
          hAxis: {
            minValue: 5,
            maxValue: 50,
            textStyle: {
              color: 'white'
            }
          }
      }}
      />

      <div>
        <h5>File Upload!</h5>
        <div>
          <input type="file" onChange={this.onFileChange} />
          <button onClick={this.onFileUpload}>
            Upload!
          </button>
          <ReactFileReader  handleFiles={this.handleFiles} fileTypes={'.csv'}>
          </ReactFileReader>
          <textarea
                cols={60}
                rows={20}
                value={this.state.text}
                // value={this.state.csvData}
                onChange={this.onFileChange}
                style={{ marginTop: 15, width: "50%" }}
            ></textarea> 
        </div>
      </div>


      {this.state.downloading && 
        <div><font size="2">Downloading model from CDN to browser..</font>
        <Box sx={{ width: '400px' }}>
        <LinearProgress />
        </Box> 
        <p></p>
        </div>
      }

       <div><font size="4">Inference Latency {this.state.latency} ms</font></div>
  
      </header> 

    </div>   
    );


  };
  

}
export default App;

