import axios from "axios";
import { response } from "express";
import Tesseract from "tesseract.js";
import express from 'express'
import fs from 'fs'
import cors from 'cors'
const app = express();
app.use(cors());


app.get('/api/files/email/:userEmail' , (req , res)=>{

  const {userEmail}=req.params

  
let myarr = [];

const Certificatedata = [];
const result = []
const keys = ["React", "react" , "angular" , "Node"]
axios.get(`https://certificatehub-backend.onrender.com/api/files/email/${userEmail}`)
  .then((response) => {
    myarr = response.data;
    // console.log(response.data);
    // console.log(myarr);
    // console.log(myarr.length);
    processImages(myarr)
      .then(() => {
        console.log("All images processed successfully");
        console.log(Certificatedata);
      })
      .catch((error) => {
        console.log("Error processing images:", error);
      })
      .finally(() => {
        Certificatedata.forEach(sentence => {
          // Check if any keyword from keys array is present in the sentence
          keys.forEach(keyword => {
              if (sentence.includes(keyword)) {
                  // If keyword is found in sentence, add it to result array
                  result.push(keyword);
              }
          });
          console.log(result);
          
      });
      res.send(result)
      });
      
  })
  .catch((error) => {
    console.log(error);
  });


async function processImages(myarr) {
  for (let index = 0; index < myarr.length; index++) {
    if (
      myarr[index].contentType == "image/jpeg" ||
      myarr[index].contentType == "image/png"
    ) {
      const imageUrl = `https://certificatehub-backend.onrender.com/api/files/${myarr[index]._id}`;
      console.log(imageUrl);

      try {
        await recognizeAndPrint(imageUrl); // Wait for recognizeAndPrint to complete
        console.log("Image processed successfully");
      } catch (error) {
        console.log("Error processing image:", error);
      }
    }
  }
}


const apiKey = "K87659615788957";
const apiUrl = "https://api.ocr.space/parse/image";

async function recognizeAndPrint(imageUrl) {
  try {
    const formData = await getImageData(imageUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        apikey: apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to recognize image. HTTP status " + response.status);
    }

    const data = await response.json();
    const extractedText = data.ParsedResults[0].ParsedText; // Extracting text from response
    const cleanedText = extractedText.replace(/\n/g, ''); // Remove line breaks

    Certificatedata.push(cleanedText);
    // console.log("Extracted Text:", cleanedText); // Optionally log the cleaned text
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // console.log(Certificatedata); // Optionally log the Certificatedata array
  }
}

async function getImageData(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const fileType = blob.type;

    const fileExtension = getFileExtension(fileType);
    const fileName = `image.${fileExtension}`;

    const formData = new FormData();
    formData.append("image", blob, fileName);

    return formData;
  } catch (error) {
    throw new Error("Error fetching image:", error);
  }
}

function getFileExtension(fileType) {
  switch (fileType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpeg";
    case "image/jpg":
      return "jpeg"; // OCR.space treats jpg as jpeg
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}



})

app.get('/' , (req,res)=>{
  res.send("working")
})

app.get('/api/fetchedArray' , (req,res)=>{
  res.send(Certificatedata);
})

app.get('/api/result' , (req,res)=>{
  res.send(result);
})

app.listen(8100 , ()=>{
  console.log('server Listlning at port 8000');
})




