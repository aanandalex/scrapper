const axios = require('axios');
const cheerio = require('cheerio');

storyLinks = [];

moscow = axios.get('https://www.themoscowtimes.com/news')
.then((response) => {
    console.log('moscow times '+ response.status);
   if(response.status == 200) {
        const $ = cheerio.load(response.data);
        const links = [];
        $('.cluster a').each((i,li) => {
            links[i] = $(li).attr('href');
        });
        storyLinks = Array.from(new Set(links));
        console.log(storyLinks);
   }
})
.catch((error) => {
    if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
      console.log(error.config);
})

setTimeout(() => {
    storyLinks.forEach(link => {
        getStoryFromRussia(link);
    });
}, 5000);

function getStoryFromRussia(link) {
    axios.get(link)
    .then((response) => {
        console.log(response.status);
        if (response.status == 200) {
            const $ = cheerio.load(response.data);
            const article = [];
            $('span').each((i,el) => {
                article[i] = $(el).text();
            });
            console.log($('.article__header  h1').text());
            const moscowNews = {
                "link": link,
                "heading": $('.article__header  h1').text(),
                "article": article
            }
        }
    })
    .catch((error) => {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log(error.request);
          } else {
            console.log('Error', error.message);
          }
          console.log(error.config);
    })
}