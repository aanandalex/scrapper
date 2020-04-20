//To get all Moscow Times Links
const axios = require('axios');
const cheerio = require('cheerio');

moscowLinks = [];

exports.callToMoscowTimes = () => {
    axios.get('https://www.themoscowtimes.com/news')
        .then((response) => {
            console.log('moscow times '+ response.status);
        if(response.status == 200) {
                const $ = cheerio.load(response.data);
                const links = [];
                $('.cluster a').each((i,li) => {
                    links[i] = $(li).attr('href');
                });
                moscowLinks = Array.from(new Set(links));
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
        });
}

