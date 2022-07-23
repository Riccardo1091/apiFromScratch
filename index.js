const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

const newspapers = [
    {name:'cityam',address:'https://www.cityam.com/london-must-become-a-world-leader-on-climate-change-action/',base:''},
    {name:'thetimes',address:'https://www.thetimes.co.uk/environment/climate-change',base:''},
    {name:'guardian',address:'https://www.theguardian.com/environment/climate-crisis',base:''},
    {name:'telegraph',address:'https://www.telegraph.co.uk/climate-change',base:'https://www.telegraph.co.uk'},
    {name:'nyt',address:'https://www.nytimes.com/international/section/climate',base:''},
    {name:'latimes',address:'https://www.latimes.com/environment',base:''},
    {name:'smh',address:'https://www.smh.com.au/environment/climate-change',base:'https://www.smh.com.au',},
    {name:'un',address:'https://www.un.org/climatechange',base:''},
    {name:'bbc',address:'https://www.bbc.co.uk/news/science_and_environment',base:'https://www.bbc.co.uk'},
    {name:'es',address:'https://www.standard.co.uk/topic/climate-change',base:'https://www.standard.co.uk'},
    {name:'sun',address:'https://www.thesun.co.uk/topic/climate-change-environment/',base:''},
    {name:'dm',address:'https://www.dailymail.co.uk/news/climate_change_global_warming/index.html',base:''},
    {name:'nyp',address:'https://nypost.com/tag/climate-change/',base:''}
]
const articles = []

// Avvio app multiplo

newspapers.forEach(newspaper => {
    // axios lancia una premise che va gestita con il then
    axios.get(newspaper.address)
    .then(response => {
        const html = response.data
        //cheerio carica tutto l'html ricevuto
        const $ = cheerio.load(html)

        $('a:contains("climate")', html).each(function () {
            const title = $(this).text()
            const url = $(this).attr('href')

            articles.push({
                title,
                url: newspaper.base + url,
                source: newspaper.name
            })
        })

    }).catch(e => console.log(e))
})

app.get('/', (req, res) => {
    res.json('Welcome to my Climate Change News API')
})

app.get('/news', (req, res) => {
    res.json(articles)
})

// Avvio app su singolo giornale attraverso URL
// i due punti creano una proprietà che accetterà come valore ciò che scriviamo dopo lo slash
app.get('/news/:newspaperId', (req, res) => {
    // req.params.newspaperId è il valore ottenuto scrivendo qualcosa dopo lo slash nel browser se abbiamo usato i due punti nel get
    const newspaperId = req.params.newspaperId
    const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
    // abbiamo ridichiarato la base per via dello scope limitato a questa specifica funzione
    const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

    axios.get(newspaperAddress)
    .then(response => {
        const html = response.data
        //cheerio carica tutto l'html ricevuto
        const $ = cheerio.load(html)
        // per via dello scope dobbiamo dichiarare la cariabile articles nuovamente qui dentro
        const specificArticles = []

        $('a:contains("climate")', html).each(function () {
            const title = $(this).text()
            const url = $(this).attr('href')

            specificArticles.push({
                title,
                url: newspaperBase + url,
                source: newspaperId
            })
        })
        res.json(specificArticles)
    }).catch(e => console.log(e))
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

// Avvio app singolo

// app.get('/news', (req, res) => {
//     axios.get('https://www.theguardian.com/environment/climate-crisis')
//     .then(response => {
//         const html = response.data
//         const $ = cheerio.load(html)

//         $('a:contains("climate")', html).each(function() {
//             const title = $(this).text()
//             const url = $(this).attr('href')
//             //Creazione oggetto con titolo contenente la parola cercata e l'url
//             articles.push({title, url})
//         })
//         res.json(articles)
//     }).catch(e => console.log('Errore -> ', e))
// })

// Avvio ascolto della porta per offrire un endpoint custom ai dati reali

