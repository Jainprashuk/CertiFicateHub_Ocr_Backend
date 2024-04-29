import axios from 'axios'
import { response } from 'express'
import Tesseract from 'tesseract.js'

let myarr = [];
axios.get('http://localhost:5000/api/files/email/sample@gmail.com')
  .then(response => {
    myarr = response.data;
    // console.log(response.data);
    // console.log(myarr);
    // console.log(myarr.length);

    for (let index = 0; index < myarr.length; index++) {
        if(myarr[index].contentType== 'image/jpeg' || myarr[index].contentType== 'image/png'){
            console.log(`http://localhost:5000/api/files/${myarr[index]._id}`);
            try {
              recognizeAndPrint(`http://localhost:5000/api/files/${myarr[index]._id}`)
            } catch (error) {
              console.log("Error");
            }
        }
    }
  })
  .catch(error => {
    console.log(error);
  });

const Certificatedata = [];

async function recognizeAndPrint(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath);
        Certificatedata.push(text)
        // console.log(text);
    } catch (error) {
        console.error('Error:', error);
    } finally{
      console.log(Certificatedata);
    }
}

console.log(Certificatedata.length);


