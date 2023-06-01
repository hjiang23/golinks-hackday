const express = require("express");
const axios = require('axios');

const app = express();

app.set("port", process.env.PORT || 3001);

app.get("/user", (req, res) => {
    const user = req.query.username;
    const forked = req.query.forked;
    // console.log(forked);

    if (!user) {
        res.json({
          error: "Missing required parameter `user`"
        });
        return;
    }
    
    axios.get(`https://api.github.com/search/repositories?q=user:${user}+fork:true`, {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28',
            'Accept' : 'application/vnd.github+json',
            // 'Authorization' : 'Bearer YOUR TOKEN'
        }
    }).then(function (response) {
        // console.log(response.data);
        res.json({
            total_count : response.data.total_count,
            total_stargazers : getTotalStargazers(response.data.items),
            total_forks : getTotalForks(response.data.items),
            avg_size : getAverageSize(response.data.items),
            languages : getLanguages(response.data.items)
        });
    }).catch(function (error) {
        console.log(error);
    });
    
});

app.listen(app.get("port"), () => {
    console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

function getTotalStargazers(items) {
    
    // console.log(items);
    
    let sum = 0;
    
    for (let i = 0; i < items.length; i++) {
        sum += items[i].stargazers_count;
        // console.log(items[i]);
    }

    return sum;
}

function getTotalForks(items) {
    let sum = 0;
    
    for (let i = 0; i < items.length; i++) {
        sum += items[i].forks_count;
        // console.log(items[i]);
    }

    return sum;
}

function getAverageSize(items) {
    let sum = 0;

    for (let i = 0; i < items.length; i++) {
        sum += items[i].size;
        // console.log(items[i]);
    }

    let average = sum/items.length

    if (average > 1000000000) {
        return average/1000000000 + ' GB';
    }

    else if (average > 1000000) {
        return average/1000000 + ' MB';
    }

    else {
        return average/1000 + ' KB';
    }
}

function getLanguages(items) {
    let obj = {};

    for (let i = 0; i < items.length; i++) {
        
        if (items[i].language == null) {
            continue;
        }
        
        if (items[i].language in obj) {
            obj[`${items[i].language}`]++;
        }
        else {
            obj[`${items[i].language}`] = 1;
        }
        
    }

    const sorted = Object.entries(obj)
    .sort(([, a], [, b]) => b - a)
    .reduce(
        (r, [k, v]) => ({
        ...r,
        [k]: v
        }),
        {}
    )

    return sorted;
}