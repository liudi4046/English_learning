const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const morgan = require('morgan');

const openai = new OpenAIApi(configuration);
// async function runCompletion(prompt){
//     // console.log(prompt)z
//     const response = await openai.createCompletion({
//         model: "curie-instruct-beta",
//         prompt: prompt,
//         temperature: 0,
//         max_tokens: 200,
        
//       });
//     console.log(response.data.choices[0].text )
      
//     return response
// }


let http = require('http');
let fs = require('fs');
const bodyParser = require('body-parser');
let express = require('express')
const readline = require('readline');
const app = express();
app.listen(5500);
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
let nonEmptyLines
let curWord
let wordIndex = 0
app.get('/',(req,res)=>{
    
    
    
    fs.readFile('words.txt', 'utf-8', (err, data) => {
        if (err) throw err;
      
        const lines = data.split('\n');
        nonEmptyLines = lines.filter((line) => line.trim() !== '');
        
        curWord=nonEmptyLines[wordIndex] + nonEmptyLines[wordIndex+1]
        wordIndex+=2
        console.log('curword:'+curWord)
        console.log('wordindex:'+wordIndex)
        res.render('index',{word:curWord});
        
    })
    
    

})


let unknownWords = []
let unknownEnWords = []
app.post('/button',(req,res)=>{
    // console.log(req.body)
    let button = req.body.word
    console.log(button)
    if(button == 'unknown'){
        console.log(curWord)
        unknownWords.push(curWord)
        
    }
    console.log(unknownWords)
    if(unknownWords.length==10){
        unknownWords.forEach(word=>{
            unknownEnWords.push(word.match(/^\d+\.\s[a-z]+/))
        })

        console.log('unknownEnWords:'+unknownEnWords)
        
        let prompt = `you use all these words to create a very long story and it is at least 200 tokens:${unknownEnWords.join(',')}`
        console.log('prompt:'+prompt)
        openai.createCompletion({
            model: "text-curie-001",
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 500,
            
          }).then(response=>{
                let completion = response.data.choices[0].text
                console.log(response.data)
                let imagePrompt = completion
                //require image
                requireImage(imagePrompt).then(image_url=>{
                    res.render('story',{
                        unknownWords:unknownWords,
                        completion:completion,
                        image_url:image_url
                    })
                })

                
          }).catch((err) => {
            console.error(err);
          })
    
        
       


        
    }
    else{
        res.redirect('/')
    }
    
})

async function requireImage(prompt){
    let response = await openai.createImage({
        prompt:prompt,
        n:1,
        size:'1024x1024'
    })
    let image_url = response.data.data[0].url;
    return image_url
    
}
 
 
 
 
 
 
 
 
 





