import {load} from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import xml2js from 'xml2js';

async function fetchAndParse() {
    const res = await fetch("https://jyj.nantong.gov.cn/truecms/messageController/getMessage.do?callback=jQuery17205550799023097566_1688881229865&startrecord=1&endrecord=670&perpage=670&contentTemplate=&columnId=852694c8-396b-4bcb-bf74-24b8ec291008&_=1688881546274", {
      "headers": {
        "accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
        "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-requested-with": "XMLHttpRequest",
        // Cookies
        // "Cookie": "",
        "Referer": "https://jyj.nantong.gov.cn/ntsjyj/gggs/gggs.html",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });

    let data = await res.text();
   // Remove the JSONP padding
   let jsonData = data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1);

   // Parse JSON
   let jsonObj = JSON.parse(jsonData);

   // Convert XML to JSON
   xml2js.parseString(jsonObj.result, function (err, result) {
       if (err) {
           console.error(err);
       } else {
           // Initialize an empty array to hold our results
           let results = [];
           // Parse each record
           for (let record of result.datastore.recordset[0].record) {
               let html = record;
               let $ = load(html);

               $('li').each(function (i, elem) {
                   let a = $(this).find('a');
                   let text = a.text();
                   // Check if the link text contains any of the specified keywords
                   if (text.includes('录用') || text.includes('招聘') || text.includes('拟聘') || text.includes('聘用') || text.includes('成绩') || text.includes('面试')) {
                       // Create an object with the link, link text, and date
                       let obj = {
                           link: 'https://jyj.nantong.gov.cn' + a.attr('href'),
                           title: text.replace(/(\n|\t)/g, ""),
                           date: $(this).find('span').text().replace('？', '') // remove unrecognised character before date
                       };
                       // Add the object to our results array
                       results.push(obj);
                   }
               });
           }

           // Write the results to a JSON file
           fs.writeFileSync('result.json', JSON.stringify(results, null, 2));
       }
   });
}

fetchAndParse();