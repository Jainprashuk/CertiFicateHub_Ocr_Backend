// const imageUrl = "http://localhost:5000/api/files/662aa4242b94261b9099c2d1";
// const apiKey = "K87659615788957";
// const apiUrl = "https://api.ocr.space/parse/image";

// async function getImageData(url) {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const fileType = blob.type;

//     const formData = new FormData();
//     formData.append("image", blob, `image.${fileType.split("/")[1]}`);

//     return formData;
//   } catch (error) {
//     throw new Error("Error fetching image:", error);
//   }
// }

// getImageData(imageUrl)
//   .then((formData) => {
//     fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         apikey: apiKey,
//       },
//       body: formData,
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to recognize image. HTTP status " + response.status);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         const extractedText = data.ParsedResults[0].ParsedText; // Extracting text from response
//         console.log("Extracted Text:", extractedText);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   })
//   .catch((error) => {
//     console.error("Error fetching image:", error);
//   });


// const express = require('express');
import express from 'express'
// const axios = require('axios');
import axios from "axios";
// const fetch = require('node-fetch');
// const FormData = require('form-data');

const app = express();
const port = 3000;

// Endpoint to process certificates for a given email
app.get('/api/email/:userEmail', async (req, res) => {
//   const { email } = req.query; // Get email from query parameters
const {userEmail}=req.params

  try {
    // Fetch files associated with the given email
    const response = await axios.get(`https://certificatehub-backend.onrender.com/api/files/email/${userEmail}`);
    const myarr = response.data;

    const Certificatedata = [];
    const keys = ['keyword1', 'keyword2']; // Add your desired keywords here
    const result = [];

    // Process each image file
    for (let index = 0; index < myarr.length; index++) {
      if (myarr[index].contentType === 'image/jpeg' || myarr[index].contentType === 'image/png') {
        const imageUrl = `https://certificatehub-backend.onrender.com/api/files/${myarr[index]._id}`;

        // Recognize and print text from the image
        await recognizeAndPrint(imageUrl, Certificatedata);
      }
    }

    // Filter sentences for specified keywords
    Certificatedata.forEach(sentence => {
      keys.forEach(keyword => {
        if (sentence.includes(keyword)) {
          result.push(keyword);
        }
      });
    });

    res.json({ result });
  } catch (error) {
    console.error('Error processing certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function recognizeAndPrint(imageUrl, Certificatedata) {
  try {
    const formData = await getImageData(imageUrl);

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: 'K87659615788957', // Replace with your OCR.space API key
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to recognize image. HTTP status ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.ParsedResults[0].ParsedText.replace(/\n/g, '');
    Certificatedata.push(extractedText);
  } catch (error) {
    console.error('Error processing image:', error);
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
    formData.append('image', blob, fileName);

    return formData;
  } catch (error) {
    throw new Error('Error fetching image:', error);
  }
}

function getFileExtension(fileType) {
  switch (fileType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg';
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

